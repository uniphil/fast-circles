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
