import io
import os
import re
import sys

from setuptools import find_packages, setup

if sys.argv[-1] == "publish":
    os.system("python setup.py sdist upload")
    sys.exit()

with open(os.path.join(os.path.dirname(__file__), 'README.md')) as readme:
    README = readme.read()


# Convert markdown to rst
try:
    from pypandoc import convert
    long_description = convert("README.md", "rst")
except:  # NOQA
    long_description = ""

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

version = ''

with io.open('wagtailleafletwidget/__init__.py', 'r', encoding='utf8') as fd:
    version = re.search(r'^__version__\s*=\s*[\'"]([^\'"]*)[\'"]',
                        fd.read(), re.MULTILINE).group(1)


setup(
    name='wagtailleafletwidget',
    version=version,
    packages=find_packages(exclude=('tests*', 'tests')),
    include_package_data=True,
    license='MIT License',
    description='Leaflet JS based wagtail geo-location widget.',
    long_description=long_description,
    url='https://github.com/wagtail-leaflet-widget',
    author='Erick Otenyo',
    author_email='otenyo.erick@gmail.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Wagtail',
        'Framework :: Wagtail :: 2',  # replace "X.Y" as appropriate
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',  # example license
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
)
