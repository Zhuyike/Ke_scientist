#!/usr/bin/env python
# encoding: utf-8

from apps.sample import BaseHandler
from tornado.web import authenticated
from worker.define import *
from tornado.ioloop import IOLoop
import config


config.load('./server.conf')
# auth = oss2.Auth(config.get("oss_AccessKeyId"), config.get("oss_AccessKeySecret"))
# bucket = oss2.Bucket(auth, config.get("oss_Address"), config.get("oss_Bucket"))


class MainHandler(BaseHandler):
    def get_(self):
        if self.role == '':
            self.get_current_user()
        control_set = self.current_user['super_control']
        if 'all' in control_set:
            control_set = control_list_no_all
            self.current_user['super_control'] = control_list_no_all
        if 'sign_up' in control_set or 'logging' in control_set or 'super_control' in control_set:
            control_set.append('admin_setting')
        if 'antifan' in control_set:
            control_set.append('revdol')
        return self.render_html('main_structure.html', control={control: control in control_set for control in control_total})

    @authenticated
    async def get(self):
        content = await IOLoop.current().run_in_executor(None, self.get_)
        await self.finish(content)


class RootHandler(BaseHandler):
    def get(self):
        self.redirect('/main')
