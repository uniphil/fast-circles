Fast Circle Markers for Leaflet
===============================


### Install

grab [`leaflet.fast-circles.min.js`](leaflet.fast-circles.min.js), or `npm install fast-circles` and `require('fast-circles')`.


### Use

```javascript
var coords = [[0, 0], [0, 0.2], [0.2, 0], [0.2, 0.2], [0.1, 0.1]];
L.fastCircles(coords, {
  radius: 21,
  color: 'green'
}).addTo(map);
```


### Build

`git clone`, `npm install`, and then `make`.
