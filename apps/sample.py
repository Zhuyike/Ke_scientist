#!/usr/bin/env python
# encoding: utf-8

from tornado.web import RequestHandler
from tornado.ioloop import IOLoop
from model import user as user_db
from model import log as log_db
from worker.tool_common import mikan_redis, get_redis
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import time


class BaseHandler(RequestHandler):
    def render_template(self, template_name, **kwargs):
        template_dirs = []
        if self.settings.get('template_path', ''):
            template_dirs.append(self.settings['template_path'])
        env = Environment(loader=FileSystemLoader(template_dirs))
        try:
            template = env.get_template(template_name)
        except TemplateNotFound:
            raise TemplateNotFound(template_name)
        content = template.render(kwargs)
        return content

    def prepare(self):
        self.ke_db = self.settings['mongo']['keientist']
        self.re_db = self.settings['mongo']['revdol_data']
        self.redis = self.settings['redis']
        self.allow_plural_login = self.settings['allow_plural_login']
        self.role = ''

    def get_user_id(self):
        return self.current_user['user_id']

    def render_html(self, template_name, **kwargs):
        kwargs.update({
            'settings': self.settings,
            'STATIC_URL': self.settings.get('static_url_prefix', '/static/'),
        })
        content = self.render_template(template_name, **kwargs)
        return content

    def get_current_user(self):
        auth_ = self.get_secure_cookie('auth')
        if not auth_:
            return None
        session_key = str(auth_, 'utf-8')
        if session_key:
            _id = get_redis(session_key, self.redis)
            if not self.allow_plural_login:
                if get_redis(_id, self.redis) != session_key:
                    _id = None
            user_data = user_db.fetch_user_by_id(self.ke_db, _id)
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

    def json_write(self, data='', msg='success', success=1):
        resp = {'data': data, 'msg': msg, 'success': success}
        super(BaseHandler, self).write(resp)

    def _logging(self, operation, target, user=''):
        data = {'operation': operation,
                'target': target,
                'time': int(time.time()),
                'user': self.get_current_user()['username'] if user == '' else user,
                'ip': self.request.remote_ip}
        log_db.new_logging(self.ke_db, data)


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
