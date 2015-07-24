'use strict';

require('leaflet');
var utils = require('./utils');


/**
 * Render lots of points on a map quickly by pruning any completely-overlapped
 */
L.FastCircles = L.Class.extend({

  options: {
    radius: 16,
    onEachFeature: function() {},
  },

  /**
   * Set up the layer state
   */
  initialize: function(centres, options) {
    L.Util.setOptions(this, options);
    this._group = L.layerGroup();
    this._centres = centres.map(function(centre) {
      return {
        latlng: L.latLng([centre[0], centre[1]]),
        feature: centre[2],
        layer: null,
      };
    });
  },

  /**
   * Hook into a map instance
   */
  onAdd: function(map) {
    map.addLayer(this._group);
    map.on('moveend', this._update, this);
    this._map = map;
    this._update();
  },

  /**
   * Clean up from a map instance
   */
  onRemove: function(map) {
    map.removeLayer(this._group);
    map.off('moveend', this._update, this);
    this._map = null;
  },

  /**
   * Inversion of the usual "to this map add layer" -> "add this to a map"
   */
  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  /**
   * Add the circle to the L.LayerGroup, making it visible on the map
   */
  _showCircle: function(centre) {
    if (centre.layer === null) {
      centre.layer = L.circleMarker(centre.latlng, this.options);
      this.options.onEachFeature(centre.feature, centre.layer);
    }
    this._group.addLayer(centre.layer);
  },

  /**
   * Remove the circle from the L.LayerGroup, so it is not rendered
   */
  _hideCircle: function(centre) {
    if (centre.layer !== null) {
      this._group.removeLayer(centre.layer);
    }
  },

  /**
   * Put a set of circles in the L.LayerGroup for viewing
   *
   * Circles that can be completely covered by other circles may be pruned,
   * since rendering them behind or not rendering them at all makes no visual
   * difference.
   */
  _update: function() {
    var mapSize = this._map.getSize(),
        mapGrid = utils.getGrid(mapSize.x, mapSize.y),
        rad = this.options.radius,
        protoCircle = utils.getCircle(rad),
        pos,
        shows,
        layer;
    this._centres.forEach(function(centre) {
      pos = this._map.latLngToContainerPoint(centre.latlng).round();
      shows = utils.overlay(mapGrid, protoCircle, [pos.x-rad, pos.y-rad]);
      if (shows) {
        this._showCircle(centre);
      } else {
        this._hideCircle(centre);
      }
    }, this);
    var tf = +new Date();
  }

});


/**
 * Factory method for creating a L.FastCircles without the `new` keyword
 */
L.fastCircles = function(centres, radius, options) {
  return new L.FastCircles(centres, radius, options);
};
