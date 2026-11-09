# Webpage Navigation and Social Blocks

A navigation bar block and a social links block for webpages. It covers the webpage row "Navigation bar block" and the webpage row "Social links and icons". The email has both, from MJML's navbar and social components, and the webpage has neither.

## Why not

A webpage builds both from parts it already has. A navigation bar is a row of buttons in a section, and social links are buttons or images in a section. The webpage's node types already hold a section, a button and an image ([document model](../../../specs/resource/page-builder/document-model/design.md)), so a block for each would repeat that composition. Social links would also need an icon set, and no webpage node type names one.
