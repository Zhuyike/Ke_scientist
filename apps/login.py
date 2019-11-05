#!/usr/bin/env python
# encoding: utf-8

from apps.sample import BaseHandler
from worker.tool_common import *
from model import user as user_db
from bson import ObjectId
from tornado.ioloop import IOLoop
import json


class LoginHandler(BaseHandler):
    def get(self):
        next_ = self.get_argument('next', '/main')
        failed = self.get_argument('failed', '')
        self.render('login.html', next_=next_, failed=failed)


class ApiLoginHandler(BaseHandler):
    def post_(self):
        user_json = json.loads(self.request.body)
        username = user_json.get('username', '')
        password = user_json.get('password__', '')
        user = user_db.login_fetch_user(self.ke_db, username)
        if user:
            password = get_md5(password + salt)
            if user['pwd'] == password:
                if user['access']:
                    redis_pipe = self.redis.pipeline(transaction=True)
                    session_key = str(ObjectId())
                    print(session_key)
                    self.set_secure_cookie('auth', session_key, expires_days=self.settings['login_ttl_day'])
                    self.redis.set(session_key + mikan_redis, str(user['_id']), ex=self.settings['login_ttl'])
                    self.redis.set(str(user['_id']) + mikan_redis, session_key, ex=self.settings['login_ttl'])
                    redis_pipe.execute()
                    self._logging(operation='登录成功', target=username, user=username)
                    return user['name']
                else:
                    return 2
            else:
                return 3
        else:
            return 4

    async def post(self):
        code = await IOLoop.current().run_in_executor(None, self.post_)
        if code == 2:
            self.write({'login': 'failed', 'msg': '该账户未开通，请联系五彩斑斓的金毛开通一下'})
        elif code == 3:
            self.write({'login': 'failed', 'msg': 'failed wrong password'})
        elif code == 4:
            self.write({'login': 'failed', 'msg': 'failed wrong user'})
        else:
            self.write({'login': 'success', 'msg': '欢迎回来：{}'.format(code)})
