from django.conf import settings

LEAFLET_WIDGET_DEFAULT_LOCATION = getattr(settings, 'LEAFLET_WIDGET_DEFAULT_LOCATION',
                                          {'lat': 0, 'lng': 0})
LEAFLET_WIDGET_ZOOM = getattr(settings, 'LEAFLET_WIDGET_ZOOM', 7)

LEAFLET_SCROLL_WHEEL_ZOOM_ENABLED = getattr(settings, 'LEAFLET_SCROLL_WHEEL_ZOOM_ENABLED', True)
