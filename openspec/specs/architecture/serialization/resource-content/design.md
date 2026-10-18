# Resource content

Resource content (Sheet, Dashboard, TodoList, …) takes a **fourth** path that is deliberately not one of the three on [serialization](../README.md). Content is saved as a JSON blob (`JSON.stringify(content)`) and read back through its Zod content schema in `readResourceContent`, `readPublishedResourceContent`, and `readSheetDataset`. That read path uses **plain `JSON.parse`** — never `jsonDateParse`.

Blanket revival is wrong here because the content is already schema-validated, so the schema knows exactly which fields are dates and coerces them itself with `z.coerce.date()`: the item-metadata timestamps (`aItemEntitySchema` — `createdAt`, `updatedAt`, `deletedAt`), `Metadata.importedAt`, and `TodoListItem.dueAt`. A reviver that guesses from string shape instead would mis-revive a genuine string field: a Sheet cell value is typed `boolean | null | number | string`, so an ISO-datetime string typed into a cell would be turned into a `Date` that `columnValueSchema` then rejects — failing the entire resource read, not just one cell.

The same rule covers the localStorage draft path: `draftsSerializer` parses with `JSON.parse` and `draftSchema.updatedAt` is a `z.coerce.date()`, so a draft body that is itself an ISO datetime stays a string.

The bytes of this blob are also the key of its retained versions, which is why their key order is settled separately in [content key order](../content-key-order/design.md).
