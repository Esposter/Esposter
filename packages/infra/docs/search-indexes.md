# Azure Search Indexes

Azure Search indexes are **data-plane resources** — not managed by Pulumi (no ARM resource type). After creating or migrating a search service, recreate indexes using the REST API with the definitions in `data/searchIndexes/`.

## Indexes

| Index name       | Definition file                          | Services                      |
| ---------------- | ---------------------------------------- | ----------------------------- |
| `messages-index` | `data/searchIndexes/messages-index.json` | dev + prod (identical schema) |

### `messages-index` summary

- **Key field**: `RowKey` (Edm.String)
- **Searchable fields** (analyzer: `standard.lucene`): `message`, `files/filename`, `appUser/name`
- **Similarity**: BM25 (default)

---

## Recreate an index on a new service

```bash
SERVICE_NAME=dev-srch-esposter-001
RG=dev-rg-esposter-ae-001
ADMIN_KEY=$(az search admin-key show --service-name $SERVICE_NAME --resource-group $RG --query primaryKey -o tsv)

curl -X PUT "https://${SERVICE_NAME}.search.windows.net/indexes/messages-index?api-version=2024-07-01" \
  -H "api-key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d @data/searchIndexes/messages-index.json
```

For prod: `SERVICE_NAME=prod-srch-esposter-001`, `RG=prod-rg-esposter-ae-001`.

---

## Role Assignment (Storage Table Data Reader)

Each search service's SystemAssigned managed identity needs `Storage Table Data Reader` on its storage account so the Azure Table indexer can read messages.

After Pulumi creates the new service, retrieve its principal ID and add a Pulumi role assignment file:

```bash
az search service show --name dev-srch-esposter-001 --resource-group dev-rg-esposter-ae-001 --query "identity.principalId" -o tsv
az search service show --name prod-srch-esposter-001 --resource-group prod-rg-esposter-ae-001 --query "identity.principalId" -o tsv
```

Add files under `src/resources/Microsoft.Authorization/roleAssignments/` pointing those principal IDs to `devstesposter001` / `prodstesposter001` respectively.

---

## Indexer and data source

Each search service has a pull indexer reading from the `Messages` Azure Table every 5 minutes.

### Recreate data source + indexer after migration

Replace `$CONN` with the storage account connection string.

```bash
# Dev
SERVICE=dev-srch-esposter-001
KEY=$(az search admin-key show --service-name $SERVICE --resource-group dev-rg-esposter-ae-001 --query primaryKey -o tsv)
CONN="<devstesposter001 connection string>"

curl -X PUT "https://$SERVICE.search.windows.net/datasources/messages-datasource?api-version=2024-07-01" \
  -H "api-key: $KEY" -H "Content-Type: application/json" \
  -d "{\"name\":\"messages-datasource\",\"type\":\"azuretable\",\"credentials\":{\"connectionString\":\"$CONN\"},\"container\":{\"name\":\"Messages\"}}"

curl -X PUT "https://$SERVICE.search.windows.net/indexers/messages-indexer?api-version=2024-07-01" \
  -H "api-key: $KEY" -H "Content-Type: application/json" \
  -d "{\"name\":\"messages-indexer\",\"dataSourceName\":\"messages-datasource\",\"targetIndexName\":\"messages-index\",\"schedule\":{\"interval\":\"PT5M\"}}"
```

For prod: use `prod-srch-esposter-001` / `prod-rg-esposter-ae-001` / `prodstesposter001` connection string.

### Trigger immediate backfill

```bash
curl -X POST "https://$SERVICE.search.windows.net/indexers/messages-indexer/run?api-version=2024-07-01" \
  -H "api-key: $KEY" -H "Content-Type: application/json" -d "{}"
```
