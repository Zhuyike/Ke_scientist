#!/usr/bin/env python
# encoding: utf-8
from abc import ABC

from apps.sample import BaseHandler
from worker.tool_common import *
from model import antifan as anti_db
from tornado.ioloop import IOLoop
from bson import ObjectId
import time


class Method(object):
    ADD = 1
    EDIT = 2


class AntiFanListHandler(BaseHandler):
    def get_(self):
        start_uptime = int(self.get_argument('start_uptime', '0'))
        end_uptime = int(self.get_argument('end_uptime', '222223968000'))
        platform = self.get_argument('platform', '')
        reason = self.get_argument('reason', '')
        uid = self.get_argument('uid', '')
        filter = dict()
        if start_uptime != 0 or end_uptime != 222223968000:
            filter['uptime'] = {'$gte': start_uptime, '$lte': end_uptime}
        if platform:
            filter['platform'] = {'$regex': ".*{}.*".format(platform)}
        if uid:
            filter['uid'] = {'$regex': ".*{}.*".format(uid)}
        if reason:
            filter['reason'] = {'$regex': ".*{}.*".format(reason)}
        antifans = anti_db.fetch_list(self.ke_db, filter)
        return_data = list()
        for antifan in antifans:
            antifan['_id'] = str(antifan['_id'])
            antifan['evidence'] = [{'address': '{}/{}{}'.format(self.oss_address_download, self.oss_antifan, evidence),
                                    'img': evidence}
                                   for evidence in antifan['evidence']]
            return_data.append(antifan)
        return return_data

    @check_control('antifan')
    async def get(self):
        return_data = await IOLoop.current().run_in_executor(None, self.get_)
        self.json_write(data=return_data)


class AntiFanMergeHandler(BaseHandler):
    def post_(self):
        evidence = self.get_argument('evidence', '').strip().split(',')
        data = dict(uid=self.get_argument('uid', ''),
                    platform=self.get_argument('platform', ''),
                    neckname=self.get_argument('neckname', ''),
                    uptime=int(self.get_argument('uptime', '0')),
                    reason=self.get_argument('reason', ''),
                    ctime=int(time.time()),
                    evidence=evidence)
        method_ = int(self.get_argument('method'))
        if method_ == Method.ADD:
            anti_db.add(self.ke_db, data)
        elif method_ == Method.EDIT:
            data['ctime'] = int(time.time())
            anti_db.modify(self.ke_db, self.get_argument('id'), data)
        return ""

    @check_control('antifan')
    async def post(self):
        return_data = await IOLoop.current().run_in_executor(None, self.post_)
        self.json_write(data=return_data)


class UpLoadHandler(BaseHandler):
    def post_(self):
        file_metas = self.request.files["fff"]
        meta = file_metas[0]
        temp_name = '{}.' + meta['filename'].split('.')[-1]
        file_name = temp_name.format(ObjectId())
        self.redis.set(meta['filename'], file_name, ex=self.settings['login_ttl'])
        try:
            self.oss.put_object(self.oss_antifan + file_name, meta['body'])
            return 'SUCCESS', {'img': file_name,
                               'address': '{}/{}{}'.format(self.oss_address_download, self.oss_antifan, file_name)}
        except Exception:
            return 'ERROR', {}

    @check_control('antifan')
    async def post(self):
        return_msg, data = await IOLoop.current().run_in_executor(None, self.post_)
        if return_msg != 'ERROR':
            self.json_write(msg=return_msg, data=data)
        else:
            self.json_write(success='Failed', msg=return_msg, data=data)
