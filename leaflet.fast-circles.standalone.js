(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fastCircles = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./utils":3,"leaflet":2}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
'use strict';


/**
 * Create a 2-d rectangular array of zeros
 */
function getGrid(width, height) {
  var rows = [],
      row,
      rowno,
      colno;
  for (rowno = 0; rowno < height; rowno++) {
    row = [];
    for (colno = 0; colno < width; colno++) {
      row.push(0);
    }
    rows.push(row);
  }
  return rows;
}


/**
 * Create a full circle on a grid sized radius*2 x radius*2
 */
function getCircle(radius) {
  var w = radius * 2,
      h = w,
      grid = getGrid(w, h),
      lrrowno,
      lrcolno,
      r,
      filled;
  for (lrrowno = 0; lrrowno < radius; lrrowno++) {
    for (lrcolno = 0; lrcolno < radius; lrcolno++) {
      r = Math.sqrt(Math.pow(lrrowno + 0.5, 2) + Math.pow(lrcolno + 0.5, 2));
      filled = (r <= radius) ? 1 : 0;
      grid[radius + lrrowno][radius + lrcolno] = filled;  // lower right
      grid[radius - lrcolno][radius + lrrowno] = filled;  // upper right
      grid[radius - lrrowno][radius - lrcolno] = filled;  // upper left
      grid[radius + lrcolno][radius - lrrowno] = filled;  // lower left
    }
  }
  return grid;
}


/**
 * Get the size of a rectangular 2d array as a 2-element array [width, height]
 */
function rectSize(arr) {
  if (arr.length === 0) {
    return [0, 0];
  } else {
    return [arr[0].length, arr.length];
  }
}


/**
 * Add a grid onto another grid
 *
 * @param dest: the grid to draw on
 * @param src: the grid to copy from
 * @param origin: [col, row] position of the top-left corner of `src` on `dest`
 * @returns boolean: `true` if the destination grid was mutated
 */
function overlay(dest, src, origin) {
  var srcSize,
      destSize,
      start,
      end,
      srcRowno,
      srcColno,
      destRowno,
      destColno,
      srcVal,
      mutated = false;
  srcSize = rectSize(src);
  destSize = rectSize(dest);
  start = origin.map(function(n) {
    return -Math.min(0, n);
  });
  end = srcSize.map(function(n, ax) {
    return Math.min(n, destSize[ax] - origin[ax]);
  });
  for (srcRowno = start[1]; srcRowno < end[1]; srcRowno++) {
    destRowno = origin[1] + srcRowno;
    for (srcColno = start[0]; srcColno < end[0]; srcColno++) {
      destColno = origin[0] + srcColno;
      srcVal = src[srcRowno][srcColno];
      if (srcVal === 0) {
        continue;  // transparent part of src
      } else if (dest[destRowno][destColno] === 1) {
        continue;  // already set on dest
      } else {
        dest[destRowno][destColno] = 1;
        mutated = true;
      }
    }
  }
  return mutated;
}


module.exports = {
  getGrid: getGrid,
  getCircle: getCircle,
  rectSize: rectSize,
  overlay: overlay,
};

},{}]},{},[1])(1)
});