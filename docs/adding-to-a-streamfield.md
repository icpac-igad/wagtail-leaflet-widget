## StreamField

To add a map in a StreamField, import and use the GeoBlock.

```python
from wagtail.core.models import Page
from wagtail.core.fields import StreamField
from wagtailleafletwidget.blocks import GeoBlock

class GeoStreamPage(Page):
    body = StreamField([
        ('map', GeoBlock()),
    ])

    content_panels = Page.content_panels + [
        StreamFieldPanel('body'),
    ]
```

The data is stored as a json struct and you can access it by using value.lat / value.lng

```html
<article>
    {% for map_block in page.stream_field %}
        <hr />
        {{ map_block.value }}
        <p>Latitude: {{ map_block.value.lat}}</p>
        <p>Longitude: {{ map_block.value.lng }}</p>
    {% endfor %}
</article>
```

