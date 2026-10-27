# Dashboard export

A Dashboard exports its page as a PNG from the resource menu, and each bound visual exports the rows it draws as CSV from its tile menu, both computed in the browser from what the page already holds.

## Scope

The Dashboard declares the Portable capability for export only, so its resource menu offers the page as a PNG. Each bound visual's tile offers a CSV of the rows it draws, in the editor and in the published view. A bound visual resolves its rows at render time through `computeDatasetVisualPropsData`, and a published dashboard holds the projected rows in its snapshot, so the published view exports without a read. It adds no server procedure and no stored data.

## Decisions

- **The page is captured in the browser, not on the server.** A server render needs a headless browser, which is a service or a dependency the owner has ruled out. The flowchart's capture already turns live markup into an SVG with its styles and rasterizes it, and the dashboard reuses that path, so the capture lives in a shared folder rather than being copied.
- **PNG only.** The alternative, a PDF, needs a renderer. The browser's print path would need a print stylesheet for the grid, which is its own piece of work, so it waits for a request.
- **A visual's CSV holds what the visual draws.** The alternative was the bound dataset's raw rows. Those rows carry every column of the source, and the publish snapshot deliberately keeps only the columns a query reads, so a public file of raw rows would leak what the snapshot removes. The drawn rows are the query's result: one row per category with a column per series, and one value for a Card.
- **Every visual with categories writes the grouped rows its Table form draws, except a pie-shaped visual.** A table is the grouped result itself, and a bar, a treemap or a slope draws the same grouped numbers over one binding, so its file is those rows. A pie, a polar area or a radial bar draws only its first series, so its file is the grouped rows of that series alone. Exporting every series for a pie would write columns its chart never shows. No visual reads a second query either way.
- **The CSV goes through the dataset export's helper.** `createDatasetCsv` already neutralises every cell that starts with a formula character. A category value is respondent text, so the neutralisation is not optional, and a second CSV writer would be the copy the repo removes. The drawn rows are passed to it as a dataset built by `createDrawnDataset`.
- **Static visuals have no CSV.** Their values are typed into the chart by the owner, and the editor already shows them. Exporting them adds a second copy of data with no source.
- **The published view exports the snapshot.** The public view never issues a live dataset read, and an export there reads the same baked rows the viewer sees.

## How it works

```mermaid
flowchart LR
  PAGE["Export PNG<br/>resource menu"] --> CAP["capture the dashboard grid<br/>markup to SVG with styles"]
  CAP --> RAS["rasterize at two times the pixel ratio"]
  RAS --> FILE1["name.png"]
  TILE["Export CSV<br/>tile menu, bound visual"] --> DRAW["computeDatasetVisualPropsData<br/>the grouped rows the visual draws"]
  DRAW --> CSV["createDatasetCsv<br/>formula cells neutralised"]
  CSV --> FILE2["visual-title.csv"]
  PUB["published view"] -->|"same commands"| SNAP["snapshot rows, no live read"]
  SNAP --> DRAW
```

- **Page image.** The command captures the grid element at its rendered size, once the document's fonts are ready. A capture that fails shows an alert and writes no file.
- **Visual rows.** The rows are the function's output for the visual's current query. A bound visual whose source is gone, or whose type draws no aggregate such as a box plot, has no rows and shows no Export CSV, since its tile already shows the error or the demo data.
- **Capped reads.** A query over a capped dataset carries the truncation the dataset export reports, so the CSV's alert says the rows are the ones read, not all the source's rows.
- **File names.** A page is named after the resource. A visual is named after its chart's title, or after its type when the title is empty.

## Key files

| File                                                                       | Role                                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`               | the Dashboard opts into the Portable capability, export only                      |
| `apps/web/app/services/resource/PortableFormatMap.ts`                      | the Dashboard's PNG entry, with no import                                         |
| `apps/web/app/services/capture/captureFlowchart.ts`                        | the capture and rasterizer the page image reuses, in the shared folder            |
| `apps/web/app/services/capture/createFlowchartSvg.ts`                      | copies computed styles and embeds font faces                                      |
| `apps/web/app/services/capture/rasterizeFlowchartSvg.ts`                   | rasterizes the SVG at two times the pixel ratio                                   |
| `apps/web/app/services/dashboard/export/exportDashboardPng.ts`             | captures the dashboard grid and downloads it as a PNG                             |
| `apps/web/app/services/dashboard/export/exportDashboardVisualCsv.ts`       | the drawn rows of one visual, as a CSV file                                       |
| `apps/web/app/services/dashboard/export/createDrawnDataset.ts`             | the drawn values of one visual, as the dataset its CSV is written from            |
| `apps/web/app/services/dashboard/dataset/computeDatasetVisualPropsData.ts` | the rows a visual draws, the source of the CSV                                    |
| `apps/web/app/composables/dashboard/useVisualPropsData.ts`                 | the render-time rows, and the resolved dataset the tile's menu exports            |
| `apps/web/app/services/dataset/createDatasetCsv.ts`                        | the header and cell rows, through the neutralising escape                         |
| `apps/web/app/components/Dashboard/Visual/Index.vue`                       | the tile's actions slot, given the resolved dataset only when the visual draws it |
| `apps/web/app/components/Dashboard/Visual/Preview/Container.vue`           | the editor tile's corner menu, where Export CSV sits beside Duplicate             |
| `apps/web/app/components/Dashboard/Grid.vue`                               | the grid element the page capture reads                                           |
| `apps/web/app/components/Dashboard/Index.vue`                              | the published grid, whose tiles offer the same CSV from the snapshot              |
| `apps/web/app/components/Resource/Dashboard/View.vue`                      | the published renderer that hosts the page export                                 |
| `apps/web/server/services/dashboard/projectDatasetToQuery.ts`              | the publish projection that decides which columns the snapshot holds              |

Three files live under `apps/web/app/services/dashboard/export/`: `exportDashboardPng.ts`, `exportDashboardVisualCsv.ts` and `createDrawnDataset.ts`.

## Notes

- The page image is a picture, so it is not an import format. The Portable capability's import path stays off for the Dashboard.
- The page image reflects the column count the page is drawn at when the command runs. A published view captures at the breakpoint column count the viewer's width picks, the same one it draws at.
