# Tasks

## 1. The codec

- [ ] 1.1 Add the XML data source type, its empty settings schema and the codec reading rows and cells, with attributes, the name attribute form and the refusals. Verify: tests named after the scenarios 'Rows and cells are read', 'A column first seen in a later row is a column', 'A cell named by attribute keeps its name', 'A row's attributes are read as cells', 'A malformed document is refused', 'A document with a doctype is refused' and 'A nested cell is refused' written first and seen failing.
- [ ] 1.2 Write the serializer with the escaping and the name attribute form for names that are not valid XML names. Verify: a test named after the scenario 'Export and import round trip' written first and seen failing.

## 2. The registration

- [ ] 2.1 Add the XML entry to the sheet's configuration map and to the portable format map, with its icon. Verify: a test named after the scenario 'The format is offered beside the others' written first and seen failing, and the create-from-file flow accepts an `.xml` file.

## 3. The record

- [ ] 3.1 Update the sheet resource's design and spec prose that names CSV, JSON and XLSX, and the create-from-file spec. Verify: `pnpm exec openspec validate resource-sheet-xml-formats --strict --no-interactive` passes.
