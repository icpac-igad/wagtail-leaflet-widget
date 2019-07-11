from wagtail.admin.edit_handlers import FieldPanel

from wagtailleafletwidget.widgets import (
    GeoField,
)

from wagtailleafletwidget.app_settings import (
    LEAFLET_WIDGET_ZOOM
)


class GeoPanel(FieldPanel):
    def __init__(self, *args, **kwargs):
        self.classname = kwargs.pop('classname', "")
        self.hide_latlng = kwargs.pop('hide_latlng', False)
        self.zoom = kwargs.pop('zoom', LEAFLET_WIDGET_ZOOM)

        super().__init__(*args, **kwargs)

    def widget_overrides(self):
        field = self.model._meta.get_field(self.field_name)
        srid = getattr(field, 'srid', 4326)

        return {
            self.field_name: GeoField(
                hide_latlng=self.hide_latlng,
                zoom=self.zoom,
                srid=srid,
                id_prefix='id_',
                used_in='GeoPanel',
            )
        }

    def clone(self):
        return self.__class__(
            field_name=self.field_name,
            classname=self.classname,
            hide_latlng=self.hide_latlng,
            zoom=self.zoom,
        )
