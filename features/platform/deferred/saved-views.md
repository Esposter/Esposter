# Saved views on the resource list

Azure "Manage view"-style named view sets: save a filter + column + sort combination under a name and recall it from a views dropdown.

## Why deferred

URL-synced filter state + the persisted column chooser ([specs/list-filters-and-views.md](../specs/list-filters-and-views.md)) already make any view reproducible (bookmark the URL); named server-side views add a table + procedures for convenience only.

## Revisit when

Filter combinations get rebuilt by hand repeatedly, or views need to be shared between devices/users.
