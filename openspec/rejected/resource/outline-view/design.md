# Outline View

A switch that draws every node's outline on the canvas at once, not only the hovered and the selected one. It covers the email row "Toggle outlines on and off" and the webpage row "Toggle outlines on and off". GrapesJS binds its outline toggle to a panel button, and our canvas outlines the hovered and selected nodes only.

## Why not

The layers tree already shows the whole structure. The email's Structure tab is that tree ([email layout](../../../specs/resource/email-layout/design.md)), and the webpage's Layers tab is the same tree ([webpage layout](../../../specs/resource/webpage-layout/design.md)). The canvas outlines the node under the pointer and the selected node, and its overlay layer draws only those and the drop indicator ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). A switch for every outline would add a fourth kind of overlay on every node, to show what the tree beside the canvas already lists.
