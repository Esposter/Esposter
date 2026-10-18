# Dashboard kiosk mode

A fullscreen, chrome-less, auto-refreshing render of a published dashboard (`/view/Dashboard/[id]?kiosk`) for TVs and wall displays.

## Why deferred

Published dashboards bake their data at publish time — an auto-refreshing view of static data refreshes nothing. Kiosk mode only means something after [realtime dataset refresh](../realtime-dataset-refresh/design.md) (or at least live reads on the public view) exists, and that is itself deferred.

## Revisit when

Live or periodically-refreshed published dashboards exist; kiosk chrome is then a weekend of CSS, not a feature.

## Cheaper interim

The browser's own fullscreen (F11) on the public view; re-publish to update the data.
