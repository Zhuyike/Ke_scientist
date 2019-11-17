#!/usr/bin/env python
# encoding: utf-8


def insert_live_data(db, data):
    return db.live_data.insert(data)


def fetch_live_list(db, filter_):
    return list(db.live_data.find(filter_))

