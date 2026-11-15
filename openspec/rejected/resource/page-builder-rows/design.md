# Page builder rows not taken

Rows of a feature comparison with GrapesJS, the editor the page builder was measured against, that the webpage and the email do not take. Each is refused for one reason: the page builder already does the job another way, or the row would add a second route to a job one route already does. Each section names the row, what it asked for, and its reason.

## Free CSS property

Entering a CSS property the style panel does not list, with its value typed in. The row is "Arbitrary CSS property entry". GrapesJS lets an author add custom properties to its style manager, and our panel offers a fixed set.

**Why not:** The style panel settles this. There is no free stylesheet, no selector the author writes and no class shared between nodes, and each node's style is a map from a property the panel offers to a value ([style panel](../../../specs/resource/page-builder/style-panel/design.md)). A property the panel does not offer would bypass the value check, which runs on the fields the panel draws, so the renderer would receive a value nothing checked.

## Interaction states

Styling a webpage node for interaction states beyond its default and hover. The row is "Interaction states". GrapesJS's state API holds any number of states on a component, and our style panel offers default and hover, with focus-visible on focusable types.

**Why not:** The style panel fixes the states at default and hover, and a focusable type's hover style also applies on keyboard focus, so no hover-only affordance ships ([style panel](../../../specs/resource/page-builder/style-panel/design.md)). Each state is a key beside the breakpoint in every node's style, and the renderer emits a state's rules after its default within each breakpoint. A further state would add a key to every node's style and an order its rules keep, and the panel's Default and Hover toggle would have to grow to match. The design holds the set at two.

## Outline view

A switch that draws every node's outline on the canvas at once, not only the hovered and the selected one. The rows are "Toggle outlines on and off", for the email and for the webpage. GrapesJS binds its outline toggle to a panel button, and our canvas outlines the hovered and selected nodes only.

**Why not:** The layers tree already shows the whole structure. The email's Structure tab is that tree ([email layout](../../../specs/resource/email-layout/design.md)), and the webpage's Layers tab is the same tree ([webpage layout](../../../specs/resource/webpage-layout/design.md)). The canvas outlines the node under the pointer and the selected node, and its overlay layer draws only those and the drop indicator ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). A switch for every outline would add a fourth kind of overlay on every node, to show what the tree beside the canvas already lists.

## Tree drag reorder

Reordering a layer by dragging it within the layers tree. The rows are "Reorder layers by dragging", for the email and for the webpage. GrapesJS makes its layers sortable by pointer, and our tree reorders from the keyboard only.

**Why not:** A node already moves without a pointer. The Alt-arrow moves go among its siblings and out to its parent, Move up and Move down sit in the toolbar, and Move to lists every slot that takes the node ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). The same design routes the pointer reorder through a node's handle on the canvas, which is not built yet. A pointer drag in the tree would be a second route to the same move, beside the one the canvas already plans.

## Webpage navigation and social blocks

A navigation bar block and a social links block for webpages. The rows are "Navigation bar block" and "Social links and icons". The email has both, from MJML's navbar and social components, and the webpage has neither.

**Why not:** A webpage builds both from parts it already has. A navigation bar is a row of buttons in a section, and social links are buttons or images in a section. The webpage's node types already hold a section, a button and an image ([document model](../../../specs/resource/page-builder/document-model/design.md)), so a block for each would repeat that composition. Social links would also need an icon set, and no webpage node type names one.

## Webpage preview mode

A mode in the webpage editor that hides the editing controls and shows the page as a reader gets it. The row is "In-editor preview mode". GrapesJS's preview command does this, and our webpage opens its published view only after a publish.

**Why not:** The canvas is already the published rendering. Its frame folds the document through the same registry the publish render uses, and a published page's scripts run in the canvas as their types' canvas components ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). The published view opens once a page is published, in `apps/web/app/components/Resource/Webpage/View.vue`. A preview mode would strip the overlays from a canvas that already draws the published markup, which repeats it.

## Webpage zip export

Exporting a webpage as a zip archive that holds its HTML and its assets. The row is "Export a zip with assets". The reference product's docs read name no such export, and our webpage exports one HTML file.

**Why not:** The cutover settles a webpage's export as one HTML file, whose images load from the app rather than being embedded, so a webpage has no asset files for a zip to hold ([cutover design](../../../changes/archive/2026-10-25-resource-page-builder-cutover/design.md)). The cutover names a webpage as having no zip exporter. The zip the email export writes holds one file per dataset row, which a webpage does not have ([webpage personalization](../../../deferred/resource/webpage-personalization/design.md)).
