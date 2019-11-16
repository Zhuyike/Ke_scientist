#!/usr/bin/env python
# encoding: utf-8

import time
import route
import redis
import logging
import argparse
import tornado.httpserver
import tornado.ioloop
import tornado.web
from pymongo import MongoClient
from tornado.web import Application
import config
import oss2
import os

g_config = None


def keientist_db_instance():
    mongo_client = MongoClient(host=config.get('mongo_host'), port=int(config.get('mongo_port')))
    mongo_client.keientist.authenticate(config.get('mongo_user'), config.get('mongo_pwd'))
    dbs = dict()
    dbs['keientist'] = mongo_client['keientist']
    dbs['revdol_data'] = mongo_client['revdol_data']
    logging.info('Keientist: connect to mongodb!')
    return dbs


def OSS_instance():
    auth = oss2.Auth(config.get('oss_AccessKeyId'), config.get('oss_AccessKeySecret'))
    bucket = oss2.Bucket(auth, config.get('oss_Address'), config.get('oss_Bucket'))
    return bucket


class RunKeientist(Application):
    def __init__(self, args):
        self.mongodb = keientist_db_instance()
        self.redis = redis.StrictRedis(host=config.get('redis_host'), port=config.get('redis_port'),
                                       password=config.get('redis_password'), socket_timeout=5.0)
        if not os.path.exists(config.get('report_path')):
            os.makedirs(config.get('report_path'))
        app_settings = {
            'debug': True if str(config.get('debug')) == '1' else False,
            'allow_plural_login': True if str(config.get('allow_plural_login')) == '1' else False,
            'login_ttl': int(config.get('login_ttl')),
            'login_ttl_day': int(config.get('login_ttl_day')),
            'mongo': self.mongodb,
            'redis': self.redis,
            'oss': OSS_instance(),
            'oss_antifan': config.get('oss_Prefix_antifan'),
            'oss_address': config.get('oss_Address'),
            'oss_address_download': config.get('oss_Address_Download')
        }
        super(RunKeientist, self).__init__(handlers=route.route_list,
                                           template_path=os.path.join(os.path.dirname(__file__), "templates"),
                                           static_path=os.path.join(os.path.dirname(__file__), "static"),
                                           login_url='/login',
                                           cookie_secret=self.mongodb['keientist'].cookie_secret.find_one()['key'],
                                           **app_settings)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG,
                        format='[%(levelname)1.1s %(asctime)s %(module)s:%(lineno)d] %(message)s',
                        datefmt='%y%m%d %H:%M:%S')
    logging.info("Keientist: Hello")
    argp = argparse.ArgumentParser()
    argp.add_argument('--debug', default=1, type=int)
    argp.add_argument('--port', default=32410, type=int)
    args = argp.parse_args()
    config.load('./server.conf')
    config.update('port', args.port)
    app = RunKeientist(args)
    http_server = tornado.httpserver.HTTPServer(app, xheaders=True)
    http_server.listen(args.port)
    logging.info("Keientist: start service at " + time.ctime() + "\n")
    try:
        tornado.ioloop.IOLoop.instance().start()
    except (KeyboardInterrupt, SystemExit):
        logging.info('Keientist: exit service at {}'.format(time.ctime()))
