# Azure Search Indexes

Azure Search indexes are **data-plane resources** — not managed by Pulumi (no ARM resource type). After creating or migrating a search service, recreate indexes using the REST API with the definitions in `data/searchIndexes/`.

## Indexes

| Index name       | Definition file                          | Services                      |
| ---------------- | ---------------------------------------- | ----------------------------- |
| `messages-index` | `data/searchIndexes/messages-index.json` | dev + prod (identical schema) |

The definition file is the index: which fields are searchable, their analyzers and the scoring weights are read
off it rather than restated here.

---

## Update an existing index

Azure AI Search does not support modifying field attributes in-place. To apply schema changes, delete and recreate the index. The indexer and data source are unaffected by index deletion and resume automatically after recreation.

```bash
SERVICE=dev-srch-esposter-001
RG=dev-rg-esposter-ae-001
KEY=$(az search admin-key show --service-name $SERVICE --resource-group $RG --query primaryKey -o tsv)

# 1. Delete existing index (indexer + data source survive)
az rest --method delete \
  --url "https://${SERVICE}.search.windows.net/indexes/messages-index?api-version=2024-07-01" \
  --headers "api-key=$KEY"

# 2. Recreate with updated schema
az rest --method put \
  --url "https://${SERVICE}.search.windows.net/indexes/messages-index?api-version=2024-07-01" \
  --headers "api-key=$KEY" "Content-Type=application/json" \
  --body @data/searchIndexes/messages-index.json

# 3. Trigger immediate reindex
az rest --method post \
  --url "https://${SERVICE}.search.windows.net/indexers/messages-indexer/run?api-version=2024-07-01" \
  --headers "api-key=$KEY"
```

For prod: `SERVICE=prod-srch-esposter-001`, `RG=prod-rg-esposter-ae-001`.

---

## Recreate an index on a new service

A new service has no index to delete, so only step 2 above applies — the same `PUT` against the new service's
name — followed by the data source and indexer below.

---

## Role Assignment (Storage Table Data Reader)

Each search service's SystemAssigned managed identity needs `Storage Table Data Reader` on its storage account so the Azure Table indexer can read messages.

After Pulumi creates the new service, retrieve its principal ID and add a Pulumi role assignment file:

```bash
az search service show --name dev-srch-esposter-001 --resource-group dev-rg-esposter-ae-001 --query "identity.principalId" -o tsv
az search service show --name prod-srch-esposter-001 --resource-group prod-rg-esposter-ae-001 --query "identity.principalId" -o tsv
```

Add files under `src/azure/resources/Microsoft.Authorization/roleAssignments/` pointing those principal IDs to `devstesposter001` / `prodstesposter001` respectively.

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
