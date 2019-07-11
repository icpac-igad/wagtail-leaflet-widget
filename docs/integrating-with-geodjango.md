# Integrating with GeoDjango

First make sure you have [GeoDjango](https://docs.djangoproject.com/en/1.10/ref/contrib/gis/) correctly setup and a PointField field defined in your model, then add a GeoPanel among your content_panels.

```python
from django.contrib.gis.db import models
from wagtailleafletwidget.edit_handlers import GeoPanel


class MyPage(Page):
    location = models.PointField(srid=4326, null=True, blank=True)

    content_panels = Page.content_panels + [
        GeoPanel('location'),
    ]
```
