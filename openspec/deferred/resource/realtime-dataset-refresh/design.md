# Realtime dataset refresh

Bound dashboard visuals updating live as new survey responses arrive (a typed event on a socket, not a tRPC subscription).

## Why deferred

Fetch-on-load + manual refresh covers the review workflow; live updates matter mostly for a "watch results come in" moment. A live feed through the dataset layer needs an object that holds the dashboards viewing a dataset, a member of an event union for its frames, the survey's responses (rows in D1) to notify that object on write, and a fan-out to those viewers. That is real complexity to add after bindings prove themselves.

## Revisit when

Stale-until-refresh is an observed annoyance with real dashboard bindings, or a live-results view becomes a headline feature.

## Cheaper interim

Manual refresh button; re-open the dashboard.
