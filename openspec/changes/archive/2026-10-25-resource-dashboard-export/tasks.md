# Tasks

Build order. Section 1 moves the capture so the page image can reuse it, and section 2 opts the Dashboard into the export. Section 3 is the visual CSV, which is independent of the page image, and section 4 is the published view. The sweep closes the change.

## 1. Shared capture

- [x] 1.1 Move `captureFlowchart`, `createFlowchartSvg` and `rasterizeFlowchartSvg` into a shared capture folder under `apps/web/app/services/`, and point the flowchart's imports at it. The flowchart's existing export tests are the proof: they are not edited.
      Verify: the flowchart export test suite passes unchanged, and a search for the old flowchart-folder paths finds no import.

## 2. Page image

- [x] 2.1 Opt the Dashboard into the Portable capability in `ResourceDefinitionMap`, with an Export PNG entry in `PortableFormatMap` and no import. Test first: the Dashboard's resource menu lists Export PNG and no Import entry.
      Verify: the menu test names match the spec delta's page scenarios.
- [x] 2.2 Capture the grid element as PNG and download it under the resource's name. Test first: a capture of a grid with two tiles produces an SVG that carries both tiles' titles, and a capture that throws shows an alert and writes no file.
      Verify: both test cases pass, and the file is named after the resource.

## 3. Visual CSV

- [x] 3.1 Write `exportDashboardVisualCsv` over `computeDatasetVisualPropsData` and `createDatasetCsv`. Test first: a bound Card writes one row, a bound chart writes a row per category with a column per series, and a category beginning with `=` is neutralised.
      Verify: the three cases pass, and the cell escape is the one `createDatasetCsv` already uses, not a copy.
- [x] 3.2 Add Export CSV to a bound visual's tile menu beside Duplicate, and hide it on a static visual and on a bound visual whose source is gone. Test first in the tile's test file.
      Verify: the tile test shows the item for a bound visual only, and the item downloads a file named after the visual.
- [x] 3.3 Warn when a bound visual's query reads a capped dataset, as the dataset export does. Test first: a capped source produces the alert and still writes the file.
      Verify: the alert names the rows read and the file is written.

## 4. Published view

- [x] 4.1 Offer the same commands on the published view, and read the rows from the snapshot. Test first: an export on a published dashboard issues no `dataset.readDataset` call.
      Verify: the published-view test asserts no live read, and the exported rows equal the snapshot's rows for that visual.

## 5. Sweep and specs

- [x] 5.1 Sweep the prose this change leaves stale: the dashboard data-binding design's Notes on what a viewer receives, and the flowchart image export's Key files, which name the moved files.
      Verify: a search for the old flowchart capture paths across `openspec/` finds only this change's references, and the flowchart export design names the shared folder.
