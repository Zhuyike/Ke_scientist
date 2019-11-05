#!/usr/bin/env python
# encoding: utf-8
from bson import ObjectId


def fetch_list(db, filter_):
    return list(db.anti_fans.find(filter_))


def add(db, data):
    db.anti_fans.insert(data)


def modify(db, _id, data):
    filter_ = dict(_id=ObjectId(_id))
    db.anti_fans.update(filter_, {"$set": data})
