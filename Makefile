BIN = node_modules/.bin


leaflet.fast-circles.min.js: leaflet.fast-circles.standalone.js
	$(BIN)/uglifyjs $< -o $@

leaflet.fast-circles.standalone.js: leaflet.fast-circles.js utils.js Makefile
	$(BIN)/browserify $< -i leaflet -s fast-circles -o $@
