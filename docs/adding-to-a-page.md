# Adding wagtail-leaflet-Widget to a Page


### First create a page

```python
from wagtail.core.models import Page

class MyPage(Page):
    ...
```


### Create a CharField that represents your data

Define a CharField representing your location, in this example we call it `location`.

```python
from django.db import models
from wagtail.core.models import Page

class MyPage(Page):
    location = models.CharField(max_length=250, blank=True, null=True)
```


### Add a content panel to represent the field in the admin

```python
from django.db import models
from wagtail.core.models import Page
from wagtailleafletwidget.edit_handlers import GeoPanel


class MyPage(Page):
    location = models.CharField(max_length=250, blank=True, null=True)

    content_panels = Page.content_panels + [
        GeoPanel('location'),
    ]
```


### The format of your location

When you update your page in the admin add a location you will notice that the address will be stored as a `GEOSGeometry` string in the database (Example: `SRID=4326;POINT(17.35448867187506 59.929179873751934)`.

It is a excellent format because this allows us to use the same GeoPanel for both the spatial field and a non-spatial field, but nothing we can display to our users. So lets add a helper that parses this into lat/lng.


```python
from django.utils.functional import cached_property
from wagtail.core.models import Page
from wagtailleafletwidget.helpers import geosgeometry_str_to_struct

class MyPage(Page):
    # ...

    @cached_property
    def point(self):
        return geosgeometry_str_to_struct(self.location)

    @property
    def lat(self):
        return self.point['y']

    @property
    def lng(self):
        return self.point['x']
```

With the helpers if place, you call `lat` or `lng` to access the coordinates.

