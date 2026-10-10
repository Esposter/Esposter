# Security Tradeoffs

These settings deviate from Azure hardening best practices. Each is an accepted tradeoff — the app is hosted on Railway, which has no Azure managed identity, making key-based auth the practical choice. Migration paths are noted if the hosting model changes.

## Storage Shared Key Access

`allowSharedKeyAccess` stays enabled.

The app uses connection-string auth (`BlobServiceClient.fromConnectionString`) and service SAS generation, both of which require shared key access:

- `apps/web/server/composables/azure/container/useContainerClient.ts`
- `packages/db/src/services/azure/container/generateUploadFileSasEntities.ts`
- `packages/db/src/services/azure/container/generateDownloadFileSasUrls.ts`
- `apps/web/server/trpc/routers/message/index.ts`
- `apps/web/server/trpc/routers/survey.ts`

Migration path: move to managed identity or user delegation SAS if the app gains an Entra-compatible identity.

## Storage Blob Public Access

`allowBlobPublicAccess` stays enabled.

`AppAssets`, `DungeonsAssets`, and `PublicUserAssets` are intentionally public for anonymous asset delivery. See `packages/db-schema/src/services/azure/container/AzureContainerPropertiesMap.ts`.

Migration path: move public assets behind signed URLs, CDN, or app-mediated delivery before disabling account-level public access.

## Azure Search Local Authentication

Search local authentication stays enabled.

The app uses `AzureKeyCredential` in `apps/web/server/composables/azure/search/useSearchClient.ts`.

Migration path: replace with an Entra credential or move the search call behind an Azure-hosted component with managed identity.

## Event Grid Topic Local Authentication

Event Grid local authentication stays enabled for the app path.

`apps/web/server/composables/azure/eventGrid/useEventGridPublisherClient.ts` uses `AzureKeyCredential`. Azure Functions already use `DefaultAzureCredential` and have the EventGrid Data Sender role assigned.

Migration path: replace the app publisher with an Entra credential path or route publishing through an Azure-hosted component.

## Web PubSub

Public client access, local authentication, and REST API access all stay enabled.

Browser clients connect from arbitrary public IPs — a static allowlist would block normal users. The app and Azure Functions use Web PubSub connection strings:

- `apps/web/server/composables/azure/webPubSub/useWebPubSubServiceClient.ts`
- `packages/db/src/services/azure/webPubSub/getWebPubSubServiceClient.ts`

Migration path: move server access to a non-key credential once the Railway identity story is resolved. Keep browser client public access separate from server-side hardening.

## Storage Network Rules

`networkRuleSet.defaultAction` stays `Allow`.

Switching to deny-all requires a complete allowlist of app, function, deployment, and admin source networks first. The app currently uses connection-string access with no private endpoint.

Migration path: identify all source networks, add private endpoints or access restrictions, then test all blob, table, and queue flows before tightening the default action.

## Keyless Game-Data Publisher

The hosted game data is written to the `app-assets` container under `genshin/data/` on each account, and that publish authenticates without a key. `DefaultAzureCredential` resolves to the owner's `az login` on their workstation, so neither a shared key nor a connection string sits on any disk.

The owner's principal holds a Storage Blob Data Contributor grant scoped to the `app-assets` container on `devstesposter001` and on `prodstesposter001`, declared in `src/azure/resources/Microsoft.Authorization/roleAssignments/jimmyChenDevstesposter001AppAssetsStorageBlobDataContributor.ts` and its prod twin. The grant itself stops at the container. It is not the principal's only path to the account's data: the same principal is subscription Owner, which can list the account's keys, and Shared Key access stays enabled (see Storage Shared Key Access), so with a key it can write any container. The Owner role carries no blob data actions, which is why the keyless publish needs the grant as a separate declaration.

This path differs from the connection-string exception at the top of this page. That exception exists because Railway has no identity to present to Azure. The publisher runs on a workstation that already holds an Azure login, so it needs no key at all. Reads stay anonymous, because `app-assets` is public for blob reads (see Storage Blob Public Access).

Migration path: not applicable, since no key exists to migrate away from. A second maintainer who publishes needs a grant of their own on each container, declared the same way.
