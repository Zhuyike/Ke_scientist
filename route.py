#!/usr/bin/env python
# encoding: utf-8
from apps import (sample, login, main, log, antifan, data)

route_list = [
    (r'/', main.RootHandler),
    (r'/demo', sample.DemoHandler),
    (r'/login', login.LoginHandler),
    (r'/main', main.MainHandler),

    (r'/api/login', login.ApiLoginHandler),
    (r'/api/fetch_logging', log.FetchLoggingHandler),
    (r'/api/anti_fans/list', antifan.AntiFanListHandler),
    (r'/api/anti_fans/merge', antifan.AntiFanMergeHandler),
    (r'/api/anti_fans/upload', antifan.UpLoadHandler),

    (r'/api/data/live/update', data.LiveUpdateHandler),
    (r'/api/data/live/list', data.LiveListHandler)
]
