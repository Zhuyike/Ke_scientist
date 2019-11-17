#!/usr/bin/env python
# encoding: utf-8

from apps.sample import BaseHandler
from worker.tool_common import *
from model import data as data_db
from tornado.ioloop import IOLoop
import time
import json


def check_sum(data):
    sum_ = "{}{}{}{}{}mikan_live_salt".format(data['uptime'], data['name'], data['total_gift'], data['active_user'],
                                            data['active_peak'])
    return get_md5(sum_)


def check_data(data):
    if len(data['top_10']) != 10:
        return False
    return True


def get_live_list(self):
    start_uptime = int(self.get_argument('start_uptime', '0'))
    end_uptime = int(self.get_argument('end_uptime', '222223968000'))
    orderby = self.get_argument('orderby', 'uptime,desc')
    name = self.get_argument('name', '')
    filter = dict()
    if start_uptime != 0 or end_uptime != 222223968000:
        filter['uptime'] = {'$gte': start_uptime, '$lte': end_uptime}
    if name:
        filter['name'] = {'$regex': ".*{}.*".format(name)}
    data_ = data_db.fetch_live_list(self.ke_db, filter)
    for live in data_:
        live['_id'] = str(live['_id'])
    return order_by(data_, orderby)


class LiveUpdateHandler(BaseHandler):
    def post_(self):
        data = json.loads(self.request.body)
        data['ctime'] = int(time.time())
        if data.pop('hash_key') == str(check_sum(data)) and check_data(data):
            data_db.insert_live_data(self.ke_db, data)
            return 'success'
        else:
            return 'error'

    async def post(self):
        return_data = await IOLoop.current().run_in_executor(None, self.post_)
        if return_data == 'error':
            self.json_write(data=None, msg=return_data, success=0)
        else:
            self.json_write(data=None, msg=return_data, success=1)


class LiveListHandler(BaseHandler):
    def get_(self):
        return get_live_list(self)

    @check_control('livedata')
    async def get(self):
        return_data = await IOLoop.current().run_in_executor(None, self.get_)
        self.json_write(data=return_data)
