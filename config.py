import configparser
import os

g_config = None


def load(filename):
    global g_config
    cf = configparser.ConfigParser()
    if os.path.isfile(filename):
        cf.read(filename)
        g_config = cf
    else:
        raise IOError(filename + ' does not exist or not file')


def update(key, value):
    global g_config
    g_config.set('default', key, str(value))


def get(key, default=None):
    global g_config
    try:
        value = g_config.get('default', key)
        if isinstance(value, str):
            value = value.strip('\'').strip('"')
        return value
    except configparser.NoOptionError as e:
        if default is None:
            raise e
        else:
            return default