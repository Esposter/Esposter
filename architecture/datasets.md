# Datasets

The standard for serving tabular data across products. Whenever one product needs to read another product's data (survey responses in a dashboard, table rows in an import), it goes through this contract — never through product-specific reads.

---

## Contract

Shared models in `packages/app/shared/models/dataset/` (one type + schema per file, interface-first). `ColumnType` and `ColumnValue` are reused from the table editor models — they are already the canonical cell-type vocabulary.

```typescript
interface DatasetColumn {
  name: string;
  type: DatasetColumnType; // ColumnType minus Computed — computed values are derived at render time
}

interface Dataset {
  columns: DatasetColumn[];
  rows: Record<string, ColumnValue>[];
}

enum DatasetProviderType {
  SurveyResponses = "SurveyResponses",
  TableDocument = "TableDocument",
}

interface DatasetReference extends ItemEntityType<DatasetProviderType> {
  id: string; // surveyId or documentId
  itemId?: string; // sub-resource within the document, e.g. a table document's data source item
}
```

`DatasetProviderType` (server-resolvable references) is a different axis from the table editor's `DataSourceType` (Csv/Json/Xlsx — file formats parsed client-side). Do not merge them: one describes _where data lives_, the other _how a file is encoded_.

---

## Serving

One procedure resolves every reference:

| Procedure             | Auth           | Input              | Purpose                            |
| --------------------- | -------------- | ------------------ | ---------------------------------- |
| `dataset.readDataset` | Resource owner | `DatasetReference` | Resolve a reference to a `Dataset` |

Public viewers never call this: published documents bake resolved datasets in at publish time (`architecture/publishing.md`).

Server structure (`server/services/dataset/`): `DatasetProviderMap.ts` maps `DatasetProviderType` → provider function, one provider per folder. Each provider owns its auth check and its column/row derivation:

- **`readSurveyResponsesDataset`** — columns from the survey model's questions (name + question-type → `ColumnType` mapping); rows flattened from `SurveyResponseEntity` JSON in Azure Table, non-primitive answers JSON-stringified, missing answers `null`; auth via survey ownership.
- **`readTableDocumentDataset`** — reads the table document's content blob and converts the referenced data source item via `dataSourceToDataset` (`#shared/services/tableEditor/`); `itemId` picks the item, absent = first.

---

## Rules

- **Row cap** (10 000) on every provider — datasets are for visualization and import, not bulk export. Add pagination only when a real consumer hits the cap.
- **Consumers choose copy or reference.** Import (table editor) copies rows once. Binding (dashboard visuals, email editor merge fields) stores the `DatasetReference` and re-resolves on load. All call the same procedure.
- **Fetch on load + manual refresh.** No live subscriptions through this layer (deferred with trigger in `features/platform/deferred/`).
- **No external providers** (HTTP APIs, SQL) until secret storage and injection-safety work is scoped — the enum grows one value per new provider, nothing else changes.
