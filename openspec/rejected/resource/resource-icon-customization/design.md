# Resource icon customization

Letting users set a custom icon or color per resource, shown in lists and blades.

## Why not

The type icon **is** the visual identity — it is how the explorer communicates "what kind of thing is this" at a glance everywhere (list rows, tiles, search results, blade headers). Per-resource overrides destroy that signal for pure decoration, and every list/search/breadcrumb surface would need to resolve icon state per row. Names and [tags](../../../specs/resource/tags/design.md) are the personalization layers.
