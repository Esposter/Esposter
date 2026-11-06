# About globe

## Why

The about page's globe is drawn by `three-globe`, which carries seventeen direct dependencies (d3-geo, h3-js, kapsule and the rest), builds its hex tiles at runtime from a half-megabyte GeoJSON, and spends its frame on labels the page cannot afford. GitHub's own globe shows the same idea drawn far more cheaply: land as one instanced mesh of dots read off a small map, arcs as Bezier tubes, pulses as expanding rings, and a frame-rate watcher that steps quality down. The technique is public, the code is not, so the globe is written here.

## What Changes

The globe is drawn by code of the app's own and `three-globe` leaves the catalog.

- Land is one instanced mesh of dots, kept where a generated land mask says there is land.
- Each arc is a tube along a cubic Bezier curve that grows, holds and fades, and a ring pulses where it lands.
- A frame-rate watcher lowers the pixel ratio and the dot density in steps when the frame rate cannot hold.
- The globe starts turned to the reader's timezone, stops drawing while off screen and draws a still frame under reduced motion.
- The half-megabyte GeoJSON and the country names are gone from the bundle: the land mask is a small generated file and the countries are bare coordinates.

## Capabilities

- **architecture/about-globe** (new)

## Impact

`Visual/Globe.vue` becomes a thin mount over a scene built from pure services. `three-globe` and its transitive packages leave the lockfile. The labels the old globe drew are dropped as a deliberate difference.
