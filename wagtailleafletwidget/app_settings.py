from django.conf import settings


LEAFLET_WIDGET_DEFAULT_LOCATION = getattr(settings, 'LEAFLET_WIDGET_DEFAULT_LOCATION',
                                      {'lat': 0, 'lng': 0})
LEAFLET_WIDGET_ZOOM = getattr(settings, 'LEAFLET_WIDGET_ZOOM', 7)
