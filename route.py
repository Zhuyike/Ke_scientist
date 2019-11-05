#!/usr/bin/env python
# encoding: utf-8
from apps import (sample, login, main, log)

route_list = [
    (r'/demo', sample.DemoHandler),
    (r'/login', login.LoginHandler),
    (r'/main', main.MainHandler),

    (r'/api/login', login.ApiLoginHandler),
    (r'/api/fetch_logging', log.FetchLoggingHandler),
    # (r'/api/anti_fan_list', )
]
