#!/usr/bin/env python
# encoding: utf-8


index_structure = {'admin_setting': ['sign_up',
                                     'logging',
                                     'super_control']}
admin_setting = \
    """
    <li class="treeview">
        <a href="#">
            <i class="glyphicon glyphicon-cog"></i> <span>管理员设置</span>
            <i class="pull-right glyphicon glyphicon-chevron-left"></i>
        </a>
        <ul class="treeview-menu">
            {}
        </ul>
    </li>
    """
index_template = {'admin_setting': admin_setting}
index_order = ['admin_setting']
