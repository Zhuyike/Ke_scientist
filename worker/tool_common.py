#!/usr/bin/env python
# encoding: utf-8


import hashlib
import functools
import logging
import requests
import xlwt


salt = 'mikan_salt'
mikan_redis = '_mikan_no_takaramono'


def get_md5(string):
    string = string.encode()
    md5 = hashlib.md5()
    md5.update(string)
    return md5.hexdigest()


def get_redis(string, redis_):
    return str(redis_.get(string + mikan_redis), 'utf-8')


def authenticated_admin(method):
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        if not self.current_user:
            self.json_write({'success': 0, 'msg': '登录信息已失效'})
            return
        if self.role != 'admin':
            self.json_write({'success': 0, 'msg': '该账户无此权限'})
            return
        return method(self, *args, **kwargs)
    return wrapper


def authenticated_user(method):
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        if not self.current_user:
            self.json_write({'success': 0, 'msg': '登录信息已失效'})
            return
        return method(self, *args, **kwargs)
    return wrapper


def verify_ticket(ticket, service_url):
    verify_url = _authorize_verify_url + '?' + 'ticket=' + ticket + '&service=' + service_url
    page = requests.get(verify_url, stream=True)
    try:
        page_iterator = page.iter_lines(chunk_size=8192)
        verify_result = next(page_iterator)
        if verify_result == 'yes':
            return next(page_iterator)
        else:
            return None
    except:
        logging.info('Ticket Verify Error!')
        return None
    finally:
        page.close()


def init_user(db):
    admin = db.user.find_one({'name': 'yike.zhu'})
    if not admin:
        admin = {"sso_username": "a99e4bceebbbba90adffc86e6814d7af",
                 "name": "yike.zhu",
                 "username": "yike.zhu",
                 "password": "b67946868d3cfb6799f4925a02e95246",
                 "role": "admin",
                 "sign_up": True,
                 "time": 0}
        db.user.insert(admin)
    elif admin['role'] != 'admin':
        admin['role'] = 'admin'
        admin['sign_up'] = True
        db.user.save(admin)
    elif not admin['sign_up']:
        admin['sign_up'] = True
        db.user.save(admin)


def get_excel_style():  # bold=True
    style_center = xlwt.XFStyle()
    alignment_center = xlwt.Alignment()
    alignment_center.horz = xlwt.Alignment.HORZ_CENTER  # 水平居中
    alignment_center.vert = xlwt.Alignment.VERT_CENTER  # 垂直居中
    style_center.alignment = alignment_center

    style_bold = xlwt.XFStyle()
    font_bold = xlwt.Font()
    font_bold.name = u'宋体'
    font_bold.bold = True
    style_bold.alignment = alignment_center
    style_bold.font = font_bold

    style_left = xlwt.XFStyle()
    alignment_left = xlwt.Alignment()
    alignment_left.horz = xlwt.Alignment.HORZ_LEFT
    style_left.alignment = alignment_left

    pattern = xlwt.Pattern()
    pattern.pattern = xlwt.Pattern.SOLID_PATTERN
    pattern.pattern_fore_colour = 5
    style_yellow = xlwt.XFStyle()
    style_yellow.pattern = pattern
    style_yellow.alignment = alignment_center

    pattern = xlwt.Pattern()
    pattern.pattern = xlwt.Pattern.SOLID_PATTERN
    pattern.pattern_fore_colour = 3
    style_green = xlwt.XFStyle()
    style_green.pattern = pattern
    style_green.alignment = alignment_center

    pattern = xlwt.Pattern()
    pattern.pattern = xlwt.Pattern.SOLID_PATTERN
    pattern.pattern_fore_colour = 2
    style_red = xlwt.XFStyle()
    style_red.pattern = pattern
    style_red.alignment = alignment_center

    return {'yellow': style_yellow, 'left': style_left, 'center': style_center, 'green': style_green,
            'red': style_red, 'bold': style_bold}