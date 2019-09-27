#!/usr/bin/env python
# encoding: utf-8

from tornado.web import RequestHandler
from tornado.ioloop import IOLoop
from model import user as user_db
from worker.tool_common import mikan_redis, get_redis


class BaseHandler(RequestHandler):
    def prepare(self):
        self.ke_db = self.settings['mongo']['keientist']
        self.redis = self.settings['redis']
        self.allow_plural_login = self.settings['allow_plural_login']
        self.role = ''

    def get_user_id(self):
        return self.current_user['user_id']

    def get_current_user(self):
        session_key = str(self.get_secure_cookie('auth'), 'utf-8')
        print(1, session_key)
        if session_key:
            _id = get_redis(session_key, self.redis)
            print(2, _id)
            if not self.allow_plural_login:
                print(3, get_redis(_id, self.redis))
                if get_redis(_id, self.redis) != session_key:
                    _id = None
            print(4, _id)
            user_data = user_db.fetch_user_by_id(self.ke_db, _id)
            print(5, user_data)
            if user_data:
                return user_data
            else:
                return None
        else:
            return None

    def write_error_response(self, wrong_message):
        resp = {'status': -1, 'wrong_message': wrong_message, 'message': u'内部调用错误，请稍后重试'}
        super(BaseHandler, self).write(resp)

    def write_error(self, status_code, **kwargs):
        self.write(u"Keientist: 阿喏，一个{}错误哦".format(status_code))


class DemoHandler(BaseHandler):
    async def get(self):
        print(await IOLoop.current().run_in_executor(None, self.ke_db.swiss.find_one))
        a = self.get_argument('a', '0')
        b = self.get_argument('b', '0')
        try:
            a = int(a)
        except:
            a = 0
        try:
            b = int(b)
        except:
            b = 0
        self.write(str(a+b))
