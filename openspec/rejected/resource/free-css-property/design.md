# Free CSS Property

Entering a CSS property the style panel does not list, with its value typed in. It covers the webpage row "Arbitrary CSS property entry". GrapesJS lets an author add custom properties to its style manager, and our panel offers a fixed set.

## Why not

The style panel settles this. There is no free stylesheet, no selector the author writes and no class shared between nodes, and each node's style is a map from a property the panel offers to a value ([style panel](../../../specs/resource/page-builder/style-panel/design.md)). A property the panel does not offer would bypass the value check, which runs on the fields the panel draws, so the renderer would receive a value nothing checked.
