import os
import subprocess

from setuptools import find_packages, setup

version = subprocess.run(['git', 'describe', '--tags'], stdout=subprocess.PIPE).stdout.decode("utf-8").strip()
assert "." in version

assert os.path.isfile("wagtailleafletwidget/version.py")
with open("wagtailleafletwidget/VERSION", "w", encoding="utf-8") as fh:
    fh.write(f"{version}\n")

with open("README.md", "r", encoding="utf-8") as readme:
    long_description = readme.read()

setup(
    name='wagtailleafletwidget',
    version=version,
    packages=find_packages(exclude=('tests*', 'tests')),
    include_package_data=True,
    license='MIT License',
    description='Leaflet JS based wagtail geo-location widget.',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='https://github.com/icpac-igad/wagtail-leaflet-widget',
    author='Erick Otenyo',
    author_email='eotenyo@icpac.net',
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
