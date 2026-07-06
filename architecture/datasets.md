# Datasets

The standard for serving tabular data across products. Whenever one product needs to read another product's data (survey responses in a dashboard, table rows in an import), it goes through this contract — never through product-specific reads.

---

## Contract

Shared models in `packages/app/shared/models/dataset/` (one type + schema per file, interface-first). `ColumnType` and `ColumnValue` are reused from the table editor models — they are already the canonical cell-type vocabulary.

```typescript
interface DatasetColumn {
  name: string;
  type: ColumnType; // Boolean | Date | Number | String
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
  publishVersion?: number; // pin to a published version; absent = latest
}
```

`DatasetProviderType` (server-resolvable references) is a different axis from the table editor's `DataSourceType` (Csv/Json/Xlsx — file formats parsed client-side). Do not merge them: one describes _where data lives_, the other _how a file is encoded_.

---

## Serving

One procedure resolves every reference:

| Procedure             | Auth                                          | Input                             | Purpose                            |
| --------------------- | --------------------------------------------- | --------------------------------- | ---------------------------------- |
| `dataset.readDataset` | Resource owner, or public via a published doc | `{ reference: DatasetReference }` | Resolve a reference to a `Dataset` |

Server structure (`server/services/dataset/`): `DatasetProviderMap.ts` maps `DatasetProviderType` → provider, one provider per file. Each provider owns its auth check and its column/row derivation:

- **SurveyResponsesProvider** — columns from the survey model's questions (name + inferred `ColumnType`); rows flattened from `SurveyResponseEntity` JSON in Azure Table; auth via survey ownership.
- **TableDocumentProvider** — a table document's content blob is already columns/rows; requires the documents layer (`architecture/documents.md`).

---

## Rules

- **Row cap** (10 000) on every provider — datasets are for visualization and import, not bulk export. Add pagination only when a real consumer hits the cap.
- **Consumers choose copy or reference.** Import (table editor) copies rows once. Binding (dashboard) stores the `DatasetReference` and re-resolves on load. Both call the same procedure.
- **Fetch on load + manual refresh.** No live subscriptions through this layer (deferred with trigger in `features/platform/deferred/`).
- **No external providers** (HTTP APIs, SQL) until secret storage and injection-safety work is scoped — the enum grows one value per new provider, nothing else changes.
