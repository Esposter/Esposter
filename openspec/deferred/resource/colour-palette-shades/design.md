# Colour picker shades

A colour picker with shades of each swatch, a custom colour list and an eyedropper. The swatches and a free colour are built.

## Why deferred

The house colour field is the browser's own picker, beside the value it holds, with the page's swatches ([ui library](../../../specs/architecture/ui-library/design.md)). Shades, a custom list and an eyedropper are changes to that shared field, so they change every colour field in the app, and the whiteboard does not own that field. The whiteboard would be the first to want them, and the shared field is where the decision belongs.

**Revisit when:** a house-wide colour control design that adds shades and a custom list is written.
