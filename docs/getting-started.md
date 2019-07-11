# Getting started

### Requirements

- Python 3.5+
- Wagtail 2.3+ and Django 2.0+


### Installation

Install the library:

```
$ git clone https://github.com/icpac-igad/wagtail-leaflet-widget
$ cd wagtail-leaflet-widget
$ python setup.py install
```


### Quick Setup

Add `wagtailleafletwidget` to your `INSTALLED_APPS` in Django settings.

```python
INSTALLED_APPS = (
    # ...
    'wagtailleafletwidget',
)
```


### Whats next?

Depending on your use case you can read either of these guides:

- [Adding the widget to a Page](./adding-to-a-page.md)
- [Integrating with GeoDjango](./integrating-with-geodjango.md)
- [Adding to a StreamField](./adding-to-a-streamfield.md)