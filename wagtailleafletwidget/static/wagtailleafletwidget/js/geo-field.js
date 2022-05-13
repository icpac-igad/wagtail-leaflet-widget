// This file must follow ES5
"use strict";

function GeoField(options) {
    const self = this;
    let defaultLocation = options.defaultLocation;

    defaultLocation = L.latLng(
        parseFloat(defaultLocation.lat),
        parseFloat(defaultLocation.lng)
    );

    this.zoom = options.zoom;
    this.scrollWheelZoom = options.scrollWheelZoom;

    this.srid = options.srid;
    this.sourceField = $(options.sourceSelector);
    this.addressField = $(options.addressSelector);
    this.latField = $(options.latDisplaySelector);
    this.lngField = $(options.lngDisplaySelector);

    this.initMap(options.mapEl, defaultLocation);
    this.initEvents();

    this.setMapPosition(defaultLocation);
    this.updateLatLng(defaultLocation);

    this.checkVisibility(function () {
        const lat = $(self.latField).val();
        const lng = $(self.lngField).val();

        const latLng = self.parseStrToLatLng(lat, lng);

        if (latLng.lat !== null && latLng.lng !== null) {
            self.updateMapFromCoords(latLng);
        }
    });
}

GeoField.prototype.initMap = function (mapEl, defaultLocation) {
    const map = L.map(mapEl, {
        zoom: this.zoom,
        center: defaultLocation,
        scrollWheelZoom: this.scrollWheelZoom,
        zoomControl: false
    });

    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker(defaultLocation, {
        draggable: true
    }).addTo(map);

    this.map = map;

    this.marker = marker;
};

GeoField.prototype.initEvents = function () {
    const self = this;

    this.marker.on("dragend", function (event) {
        self.setMapPosition(event.target.getLatLng());
        self.updateLatLng(event.target.getLatLng());
        self.writeLocation(event.target.getLatLng());

        self.clearAllFieldMessages()
    });

    this.map.on("click", function (e) {
        self.setMapPosition(e.latlng);
        self.updateLatLng(e.latlng);
        self.writeLocation(e.latlng);
    });

    this.latField.on("input", function (e) {
        const lat = $(this).val();
        const lng = self.lngField.val()
        const latLng = self.parseStrToLatLng(lat, lng);

        if (latLng.lat === null) {
            self.displayWarning(
                "Invalid coordinate value",
                {field: self.latField});
            return;
        }

        self.clearFieldMessage({field: self.latField});
        self.updateMapFromCoords(latLng);
        self.writeLocation(latLng);
    });

    this.lngField.on("input", function (e) {
        const lng = $(this).val();
        const lat = self.latField.val()
        const latLng = self.parseStrToLatLng(lat, lng);

        if (latLng.lng === null) {
            self.displayWarning(
                "Invalid coordinate value",
                {field: self.lngField});
            return;
        }

        self.clearFieldMessage({field: self.lngField});
        self.updateMapFromCoords(latLng);
        self.writeLocation(latLng);
    });
};


GeoField.prototype.genMessageId = function (field) {
    return "wagtailgeowdidget__" + field.attr("id") + "--warning";
};

GeoField.prototype.displayWarning = function (msg, options) {
    let warningMsg;
    const field = options.field;
    const className = this.genMessageId(field);

    this.clearFieldMessage({field: field});

    warningMsg = document.createElement("p");
    warningMsg.className = "help-block help-warning " + className;
    warningMsg.innerHTML = msg;

    $(warningMsg).insertAfter(field);
};

GeoField.prototype.displaySuccess = function (msg, options) {
    const self = this;
    let successMessage;
    const field = options.field;
    const className = this.genMessageId(field);

    clearTimeout(this._successTimeout);

    this.clearFieldMessage({field: field});

    successMessage = document.createElement("p");
    successMessage.className = "help-block help-info " + className;
    successMessage.innerHTML = msg;

    $(successMessage).insertAfter(field);

    this._successTimeout = setTimeout(function () {
        self.clearFieldMessage({field: field});
    }, 3000);
};

GeoField.prototype.clearFieldMessage = function (options) {
    const field = options.field;

    if (!field) {
        return;
    }

    const className = this.genMessageId(field);
    $("." + className).remove();
};

GeoField.prototype.clearAllFieldMessages = function () {
    const self = this;
    const fields = [this.addressField, this.latField, this.lngField];
    fields.map(function (field) {
        self.clearFieldMessage({field: field});
    });
};

GeoField.prototype.checkVisibility = function (callback) {
    const self = this;
    let intervalId = setInterval(function () {
        const visible = $(self.map.getContainer()).is(":visible");
        if (!visible) {
            return;
        }

        clearInterval(intervalId);
        callback();
    }, 1000);
};

GeoField.prototype.updateLatLng = function (latLng) {
    this.latField.val(latLng.lat)
    this.lngField.val(latLng.lng)
};

GeoField.prototype.parseStrToLatLng = function (latStr, lngStr) {
    const latLng = {
        lat: Number(latStr),
        lng: Number(lngStr),
    }

    if (isNaN(latLng.lat)) {
        latLng.lat = null
    }
    if (isNaN(latLng.lng)) {
        latLng.lng = null
    }

    if (latLng.lat && latLng.lng) {
        return L.latLng(latLng.lat, latLng.lng);
    }

    return latLng;
};

GeoField.prototype.updateMapFromCoords = function (latLng) {
    this.setMapPosition(latLng);
};

GeoField.prototype.setMapPosition = function (latLng) {
    this.marker.setLatLng(latLng);
    this.map.setView(latLng);
};

GeoField.prototype.writeLocation = function (latLng) {
    const lat = latLng.lat;
    const lng = latLng.lng;
    const value = "SRID=" + this.srid + ";POINT(" + lng + " " + lat + ")";

    this.sourceField.val(value);
};

GeoField.locationStringToStruct = function (locationString) {
    if (!locationString) {
        return {};
    }

    const matches = locationString.match(
        /^SRID=([0-9]{1,});POINT\s?\((-?[0-9\.]{1,})\s(-?[0-9\.]{1,})\)$/
    );

    return {
        srid: matches[1],
        defaultLocation: {
            lng: matches[2],
            lat: matches[3]
        }
    };
};

function initializeGeoFields() {
    $(".geo-field").each(function (index, el) {
        const $el = $(el);
        // Exit if component has already been initialized
        if ($el.data("geoInit")) return;

        let data = window[$el.data("data-id")];
        const sourceField = $(data.sourceSelector);

        // If sourceField contains value, parse and apply it over data
        const sourceFieldData = GeoField.locationStringToStruct(sourceField.val());
        data = Object.assign({}, data, sourceFieldData);

        // Fix for wagtail-react-streamfield
        // Resolve address by finding closest struct block, then address field
        // if (
        //   inStreamField(data) &&
        //   inReactStreamField(data) &&
        //   data.addressSelector
        // ) {
        //   data.addressSelector = $el
        //     .parents(".c-sf-container__block-container")
        //     .find(".geo-address-block input");
        // }

        new GeoField({
            mapEl: el,
            sourceSelector: sourceField,
            addressSelector: data.addressSelector,
            latDisplaySelector: data.latDisplaySelector,
            lngDisplaySelector: data.lngDisplaySelector,
            zoom: data.zoom,
            scrollWheelZoom: data.scroll_wheel_zoom,
            srid: data.srid,
            defaultLocation: data.defaultLocation
        });

        $el.data("geoInit", true);
    });

    function inStreamField(data) {
        return data.usedIn === "GeoBlock";
    }

    function inReactStreamField(data) {
        return data.inReactStreamfield;
    }
}
