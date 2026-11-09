# Webpage Personalization

Merge fields and dynamic data bound to a webpage, so each row of a dataset gets its own page. It covers the webpage row "Merge fields or dynamic data bound to the page". The reference product's data sources module binds data to a page, and our merge fields exist only on the email.

## Why deferred

Merge fields exist only on the email, through its dataset reference ([email personalization](../../../specs/resource/email-personalization/design.md)). A webpage has no dataset reference, and its export is one HTML file ([cutover design](../../../changes/archive/2026-10-25-resource-page-builder-cutover/design.md)). A page for each row would need one file per row. The email's personalised export already writes one file per row into a zip, through the zip core in `apps/web/app/services/emailEditor/exportPersonalizedHtml.ts`. How a webpage delivers such files is the open question, since the cutover settled one file for a webpage.

**Revisit when:** a per-row export design for webpages says how a page binds a dataset and how its per-row files are delivered.
