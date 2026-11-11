## Why

A sheet imports and exports CSV, JSON and XLSX. XML is the exchange format of a large share of the feeds, exports and configuration files an owner has to bring in, and the sheet cannot read or write it. The owner converts it elsewhere first.

## What Changes

- A sheet imports an XML file, reading each repeated child of the root as a row and each of the row's children as a cell.
- A sheet exports XML, one element per row and one element per cell, with the column's name kept exactly.
- The format is one more entry in the sheet's format map, so it appears in the import and export submenus beside the others and in the create-from-file flow, beside the sheet settings union and its defaults, which each take the new type.

## Capabilities

### Modified Capabilities

- `sheet-resource`: XML joins CSV, JSON and XLSX as an import and export format.

## Impact

One new data source type with an empty settings schema, one codec pair, and one entry in each of the format map and the portable format map, and one member in the sheet settings union and the function that builds its defaults. The import goes through the same type inference, preview and content size limit as the other formats.
