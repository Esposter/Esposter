# Webpage Preview Mode

A mode in the webpage editor that hides the editing controls and shows the page as a reader gets it. It covers the webpage row "In-editor preview mode". GrapesJS's preview command does this, and our webpage opens its published view only after a publish.

## Why not

The canvas is already the published rendering. Its frame folds the document through the same registry the publish render uses, and a published page's scripts run in the canvas as their types' canvas components ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). The published view opens once a page is published, in `apps/web/app/components/Resource/Webpage/View.vue`. A preview mode would strip the overlays from a canvas that already draws the published markup, which repeats it.
