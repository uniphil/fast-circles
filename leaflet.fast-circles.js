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
        id: centre[2],
        layer: null,
      };
    });
    this._byId = this._centres.reduce(function(map, c) {
      map[c.id] = c;
      return map;
    }, {});
  },

  /**
   * Ensure that the circle at this ID is rendered on the map
   */
  showCircle: function(id) {
    this._showCircle(this._byId[id]);
  },

  /**
   * Iterate all the circles, recieving a {latlng, id, layer} object for each
   *
   * the `layer` property will be null if it has not been added to the map
   */
  eachCircle: function(cb) {
    this._centres.forEach(cb);
  },

  /**
   * Get a circle by ID in the same format as `eachCircle`
   */
  getCircle: function(id) {
    return this._byId[id];
  },

  /**
   * Iterate all circles currently rendered on the map
   *
   * `cb` gets two param: (id, layer)
   */
  eachVisibleLayer: function(cb) {
    this.group.eachLayer(function(l) {
      cb(l.circleId, l);
    });
  },

  /**
   * Get the leaflet layer for a circle with given ID.
   *
   * If the circle was pruned, it is added to the map before returning.
   */
  getLayer: function(id) {
    this.showCircle(id);
    return this._byId[id].layer;
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
      centre.layer.circleId = centre.id;
      this.options.onEachFeature(centre.id, centre.layer);
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
