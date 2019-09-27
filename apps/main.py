#!/usr/bin/env python
# encoding: utf-8

from apps.sample import BaseHandler
from tornado.web import authenticated
from worker.html_structure import *
from worker.define import *
import copy
import oss2
import config


config.load('./server.conf')
# auth = oss2.Auth(config.get("oss_AccessKeyId"), config.get("oss_AccessKeySecret"))
# bucket = oss2.Bucket(auth, config.get("oss_Address"), config.get("oss_Bucket"))


class MainHandler(BaseHandler):
    @authenticated
    def get(self):
        if self.role == '':
            self.get_current_user()
        control_set = set(self.current_user['super_control'])
        if 'all' in control_set:
            control_set = set(control_list_no_all)
            self.current_user['super_control'] = control_list_no_all
        recent_structure = copy.deepcopy(index_structure)
        for key in recent_structure.keys():
            recent_structure[key] = [item for item in recent_structure[key] if item in control_set]
            if len(recent_structure[key]) == 0:
                recent_structure.pop(key)
        index_tree = ''
        for key in index_order:
            if key in recent_structure.keys():
                temp_leaf = ''
                for control in recent_structure[key]:
                    with open('./templates/html_structrue/{}/index.html'.format(control), 'r', encoding='utf-8') as f_temp:
                        temp__ = f_temp.read()
                        print(type(temp__))
                        temp_leaf += temp__
                temp_branch = index_template[key].format(temp_leaf)
                index_tree += temp_branch
        content = ''
        script = ''
        for control in self.current_user['super_control']:
            with open('./templates/html_structrue/{}/content.html'.format(control), 'r', encoding='utf-8') as f_temp:
                content += f_temp.read()
            with open('./templates/html_structrue/{}/script.html'.format(control), 'r', encoding='utf-8') as f_temp:
                script += f_temp.read()
        # self._logging('login', '')
        with open('./templates/main_structure.html', 'r', encoding='utf-8') as f_temp:
            html = f_temp.read().format(index_tree, content, script)
        self.write(html)
