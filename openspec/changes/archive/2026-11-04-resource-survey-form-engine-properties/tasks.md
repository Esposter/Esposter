# Tasks

Build order. The panel and the three list editors are independent once the map's shape is fixed.

## 1. Panel

- [x] 1.1 Build `Properties.vue` and the extras map, drawing each kind's form schema with the schema form.
      Verify: a test per kind pins the field list of its form schema, and a form edit writes the props it changed as one edit.

## 2. List editors

- [x] 2.1 Build the choice list editor with add, remove, keyboard reorder, pasted lines and the unique-value rule.
      Verify: each scenario in the spec delta's choice requirement is a test, and the duplicate is flagged and not written.
- [x] 2.2 Build the matrix column editor, the matrix row and column lists and the multiple text item editor.
      Verify: a column added, renamed and removed reaches the document, and a dynamic matrix column's cell type is set.
