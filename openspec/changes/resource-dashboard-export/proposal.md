# Dashboard export

Gap 4 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## Why

A Dashboard cannot be exported in any form. The portable map has entries for the other types that export, and the Dashboard is missing, so the resource menu offers it nothing to send. The CSV command reaches only dataset providers, and a Dashboard is a dataset consumer, not a provider. No spec covers a dashboard image, a PDF or a print.

A report is the type whose output a reader most often sends on, and the resource roadmap already names Power BI as the Dashboard's depth reference. Power BI exports the page and each visual's rows. Without either, an owner who wants to share a dashboard takes a screenshot of it, and the rows behind a chart stay in the app.

## What Changes

- The Dashboard opts into the Portable capability as an export-only type. Its resource menu gains **Export PNG**, which captures the dashboard page as it is drawn.
- Each bound visual gains **Export CSV** in its tile's menu, beside Duplicate. The file holds the rows the visual draws: the categories and series of its query, or the one value of a Card, or the grouped rows of a Table.
- The published view offers the same two commands. Its exports read the published snapshot, so a public viewer's file holds no more than the page shows.

## Recommendation

Export the page as PNG and each visual as CSV, and take neither from the server.

- PNG reuses the capture the flowchart's image export already runs: the page's markup is copied into an SVG with its styles, then rasterized in the browser. No new dependency and no headless browser.
- CSV is the data the visual is drawn from, computed by the function that already draws it, so the file agrees with the screen. It is written through the same CSV helper the dataset export uses, so an answer typed by a respondent cannot run as a formula when the file is opened.
- PDF is not in this change. A PDF needs a renderer, which would be a new service or a new dependency, or the browser's print path, which needs its own print stylesheet. The print stylesheet can follow as its own change if the owner asks for it.

## Capabilities

- **resource/dashboard-export** (new): the page image, the per-visual CSV, and the published view's exports.

## Impact

- The Dashboard's resource menu lists an export it did not list before, and the Portable capability's import path stays off, since a picture cannot restore a dashboard.
- Static visuals have no CSV. Their numbers are typed into the chart by the owner and are already in the editor.
- A bound visual over a capped dataset exports what was read and says so in an alert, as the dataset export does.
