import os

from IPython.utils.path import get_ipython_dir
import requests


ip_dir = get_ipython_dir()
nbext_dir = os.path.join(ip_dir, 'nbextensions')


def install_files(url, dir, files):
    base_url = url + '/' + dir
    base_path = os.path.join(nbext_dir, dir)
    try:
        os.makedirs(base_path)
    except OSError:
        pass
    for f in files:
        url = '/'.join([base_url]+f)
        path = os.path.join(base_path, *f)
        try:
            os.makedirs(os.path.split(path)[0])
        except OSError:
            pass
        r = requests.get(url)
        with open(path, 'wb') as f:
            print('installing: %s' % path)
            f.write(r.content)


d3_url = 'https://cdnjs.cloudflare.com/ajax/libs/'
d3_dir = 'd3/3.4.7'
d3_files = [['d3.min.js',]]

install_files(d3_url, d3_dir, d3_files)