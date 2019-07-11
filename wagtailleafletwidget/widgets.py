import json

import six
from django.forms import HiddenInput
from django.utils.html import format_html
from django.utils.safestring import mark_safe

try:
    from django.contrib.gis.geos.point import Point
except:  # NOQA
    Point = None

from wagtailleafletwidget.helpers import geosgeometry_str_to_struct
from wagtailleafletwidget.app_settings import (
    LEAFLET_WIDGET_DEFAULT_LOCATION,
    LEAFLET_WIDGET_ZOOM,
)


class GeoField(HiddenInput):
    id_prefix = 'id_'
    srid = None
    hide_latlng = False
    used_in = "GeoField"

    def __init__(self, *args, **kwargs):
        self.srid = kwargs.pop('srid', self.srid)
        self.hide_latlng = kwargs.pop('hide_latlng', self.hide_latlng)
        self.id_prefix = kwargs.pop('id_prefix', self.id_prefix)
        self.zoom = kwargs.pop('zoom', LEAFLET_WIDGET_ZOOM)
        self.used_in = kwargs.pop('used_in', "GeoField")

        super(GeoField, self).__init__(*args, **kwargs)

    class Media:
        css = {
            'all': ('wagtailleafletwidget/css/geo-field.css', 'https://unpkg.com/leaflet@1.5.1/dist/leaflet.css')
        }

        js = (
            'wagtailleafletwidget/js/geo-field.js',
            'https://unpkg.com/leaflet@1.5.1/dist/leaflet.js',
        )

    def render(self, name, value, attrs=None, renderer=None):
        out = super(GeoField, self).render(
            name, value, attrs, renderer=renderer
        )

        input_classes = "geo-field-location"
        if self.hide_latlng:
            input_classes = "{} {}".format(
                input_classes,
                "geo-field-location--hide",
            )

        location = format_html(
            '<div class="input">'
            '<input id="_id_{}_latlng" class="{}" maxlength="250" type="text">'
            '</div>',
            name,
            input_classes,
        )

        # A hack to determine if field is inside the new react streamfield
        in_react_streamfield = name.endswith("__ID__")

        namespace = ''
        if '-' in name:
            namespace = name.split('-')[:-1]
            namespace = '-'.join(namespace)
            namespace = '{}-'.format(namespace)

        source_selector = '#{}{}'.format(self.id_prefix, name)

        data = {
            'sourceSelector': source_selector,
            'defaultLocation': LEAFLET_WIDGET_DEFAULT_LOCATION,
            'latLngDisplaySelector': '#_id_{}_latlng'.format(name),
            'zoom': self.zoom,
            'srid': self.srid,
            'usedIn': self.used_in,
            'inReactStreamfield': in_react_streamfield,
        }

        if value and isinstance(value, six.string_types):
            result = geosgeometry_str_to_struct(value)
            if result:
                data['defaultLocation'] = {
                    'lat': result['y'],
                    'lng': result['x'],
                }

        if value and Point and isinstance(value, Point):
            data['defaultLocation'] = {
                'lat': value.y,
                'lng': value.x,
            }

        json_data = json.dumps(data)
        data_id = 'geo_field_{}_data'.format(name)

        return mark_safe(
            '<script>window["{}"] = {};</script>'.format(data_id, json_data) +
            out +
            location +
            '<div class="geo-field" data-data-id="{}"></div>'.format(data_id) +
            """
            <script>
            (function(){
                if (document.readyState === 'complete') {
                    return initializeGeoFields();
                }

                $(window).on('load', function() {
                    initializeGeoFields();
                });
            })();
            </script>
            """
        )
