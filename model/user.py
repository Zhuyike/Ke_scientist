#!/usr/bin/env python
# encoding: utf-8

from bson import ObjectId


def login_fetch_user(db, username):
    return db.user.find_one({'username': username})


def fetch_user_by_id(db, _id):
    return db.user.find_one({'_id': ObjectId(_id)})
