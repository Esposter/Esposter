# Webpage Zip Export

Exporting a webpage as a zip archive that holds its HTML and its assets. It covers the webpage row "Export a zip with assets". The reference product's docs read name no such export, and our webpage exports one HTML file.

## Why not

The cutover settles a webpage's export as one HTML file, whose images load from the app rather than being embedded, so a webpage has no asset files for a zip to hold ([cutover design](../../../changes/archive/2026-10-25-resource-page-builder-cutover/design.md)). The cutover names a webpage as having no zip exporter. The zip the email export writes holds one file per dataset row, which a webpage does not have ([webpage personalization](../../../deferred/resource/webpage-personalization/design.md)).
