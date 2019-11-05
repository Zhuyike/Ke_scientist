#!/usr/bin/env python
# encoding: utf-8


def new_logging(db, data):
    db.logging.insert(data)


def fetch_logging_all(db):
    return list(db.logging.find({}))
