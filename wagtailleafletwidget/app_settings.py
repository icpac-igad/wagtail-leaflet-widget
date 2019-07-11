from django.conf import settings


GEO_WIDGET_DEFAULT_LOCATION = getattr(settings, 'GEO_WIDGET_DEFAULT_LOCATION',
                                      {'lat': 0, 'lng': 0})
GEO_WIDGET_ZOOM = getattr(settings, 'GEO_WIDGET_ZOOM', 7)
