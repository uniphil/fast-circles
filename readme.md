## ⚠️ Unmaintained ⚠️

No idea if this still works with current Leaflet, or if other marker packages have caught up with its performance, but it's been a while since any project I worked on had the kind of demanding maps requirments that motivated this project.

Issues and pull requests are still open, and if someone is actually using it, that'd probably be enough motivation for me to fix bugs you find, but it's no longer under active development :)


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
