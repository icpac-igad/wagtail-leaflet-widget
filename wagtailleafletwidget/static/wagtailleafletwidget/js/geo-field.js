// This file must follow ES5
"use strict";

function GeoField(options) {
  var self = this;
  var defaultLocation = options.defaultLocation;

  defaultLocation = L.latLng(
    parseFloat(defaultLocation.lat),
    parseFloat(defaultLocation.lng)
  );

  this.zoom = options.zoom;
  this.srid = options.srid;
  this.sourceField = $(options.sourceSelector);
  this.addressField = $(options.addressSelector);
  this.latLngField = $(options.latLngDisplaySelector);

  this.initMap(options.mapEl, defaultLocation);
  this.initEvents();

  this.setMapPosition(defaultLocation);
  this.updateLatLng(defaultLocation);

  this.checkVisibility(function() {
    var coords = $(self.latLngField).val();
    var latLng = self.parseStrToLatLng(coords);
    self.updateMapFromCoords(latLng);
  });
}

GeoField.prototype.initMap = function(mapEl, defaultLocation) {
  var map = L.map(mapEl, {
    zoom: this.zoom,
    center: defaultLocation
  });

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var marker = L.marker(defaultLocation, {
    draggable: true
  }).addTo(map);

  this.map = map;

  this.marker = marker;
};

GeoField.prototype.initEvents = function() {
  var self = this;

  this.marker.on("dragend", function(event) {
    self.setMapPosition(event.target.getLatLng());
    self.updateLatLng(event.target.getLatLng());
    self.writeLocation(event.target.getLatLng());
  });

  this.map.on("click", function(e) {
    self.setMapPosition(e.latlng);
    self.updateLatLng(e.latlng);
    self.writeLocation(e.latlng);
  });

  this.latLngField.on("input", function(e) {
    var coords = $(this).val();
    var latLng = self.parseStrToLatLng(coords);
    if (latLng === null) {
      self.displayWarning(
        "Invalid location coordinate, use Latitude and Longitude " +
          "(example: 59.3293234999,18.06858080003)",
        {
          field: self.latLngField
        }
      );
      return;
    }

    self.clearFieldMessage({ field: self.latLngField });
    self.updateMapFromCoords(latLng);
    self.writeLocation(latLng);
  });
};

GeoField.prototype.genMessageId = function(field) {
  return "wagtailgeowdidget__" + field.attr("id") + "--warning";
};

GeoField.prototype.displayWarning = function(msg, options) {
  var warningMsg;
  var field = options.field;
  var className = this.genMessageId(field);

  this.clearFieldMessage({ field: field });

  warningMsg = document.createElement("p");
  warningMsg.className = "help-block help-warning " + className;
  warningMsg.innerHTML = msg;

  $(warningMsg).insertAfter(field);
};

GeoField.prototype.displaySuccess = function(msg, options) {
  var self = this;
  var successMessage;
  var field = options.field;
  var className = this.genMessageId(field);

  clearTimeout(this._successTimeout);

  this.clearFieldMessage({ field: field });

  successMessage = document.createElement("p");
  successMessage.className = "help-block help-info " + className;
  successMessage.innerHTML = msg;

  $(successMessage).insertAfter(field);

  this._successTimeout = setTimeout(function() {
    self.clearFieldMessage({ field: field });
  }, 3000);
};

GeoField.prototype.clearFieldMessage = function(options) {
  var field = options.field;

  if (!field) {
    return;
  }

  var className = this.genMessageId(field);
  $("." + className).remove();
};

GeoField.prototype.clearAllFieldMessages = function() {
  var self = this;
  var fields = [this.addressField, this.latLngField];
  fields.map(function(field) {
    self.clearFieldMessage({ field: field });
  });
};

GeoField.prototype.checkVisibility = function(callback) {
  var self = this;
  var intervalId = setInterval(function() {
    var visible = $(self.map.getContainer()).is(":visible");
    if (!visible) {
      return;
    }

    clearInterval(intervalId);
    callback();
  }, 1000);
};

GeoField.prototype.updateLatLng = function(latLng) {
  this.latLngField.val(latLng.lat + "," + latLng.lng);
};

GeoField.prototype.parseStrToLatLng = function(value) {
  value = value.split(",").map(function(value) {
    return parseFloat(value);
  });

  var latLng = L.latLng(value[0], value[1]);

  if (isNaN(latLng.lat) || isNaN(latLng.lng)) {
    return null;
  }
  return latLng;
};

GeoField.prototype.updateMapFromCoords = function(latLng) {
  this.setMapPosition(latLng);
};

GeoField.prototype.setMapPosition = function(latLng) {
  this.marker.setLatLng(latLng);
  this.map.setView(latLng);
};

GeoField.prototype.writeLocation = function(latLng) {
  var lat = latLng.lat;
  var lng = latLng.lng;
  var value = "SRID=" + this.srid + ";POINT(" + lng + " " + lat + ")";

  this.sourceField.val(value);
};

GeoField.locationStringToStruct = function(locationString) {
  if (!locationString) {
    return {};
  }

  var matches = locationString.match(
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
  $(".geo-field").each(function(index, el) {
    var $el = $(el);

    // Exit if component has already been initialized
    if ($el.data("geoInit")) return;

    var data = window[$el.data("data-id")];
    var sourceField = $(data.sourceSelector);

    // If sourceField contains value, parse and apply it over data
    var sourceFieldData = GeoField.locationStringToStruct(sourceField.val());
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
      latLngDisplaySelector: data.latLngDisplaySelector,
      zoom: data.zoom,
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
