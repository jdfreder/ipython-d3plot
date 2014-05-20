import os
from urlparse import urljoin

from IPython.display import display, HTML, Javascript

d3_js = 'd3.min'
d3_url = '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.7'

def get_static_path():
    return os.path.join(os.path.split(__file__)[0], 'static')


def initialize_notebook(d3_url=d3_url):
    """Initialize the JavaScript for this widget.

    When called as::

        initialize_notebook()

    an internet connection is required.

    To run without an internet connection, run the script
    `install-nbextension.py` in the source tree of this project and
    then call::

        initialize_notebook(d3_url='/nbextensions/d3/3.4.7')
    """
    with open(os.path.join(get_static_path(), 'stackedarea.js')) as f:
        template = f.read()
        template = template.replace('%(d3_url)', d3_url+'/'+d3_js)
        display(Javascript(template))
