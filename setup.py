# -*- coding: utf-8 -*-

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='d3plot',
    version='0.1',
    description='An IPython widget for dynamic d3 plots',
    author='Jonathan Frederic',
    author_email='jon.freder@gmail.com',
    license='MIT License',
    url='https://github.com/jdfreder/ipython-d3plot',
    keywords='data visualization interactive interaction python ipython widgets widget',
    classifiers=['Development Status :: 4 - Beta',
                 'Programming Language :: Python :: 2.7',
                 'License :: OSI Approved :: MIT License'],
    packages=['d3plot'],
    package_data={'': ['*.js',
                       'static/*.js']}
)
