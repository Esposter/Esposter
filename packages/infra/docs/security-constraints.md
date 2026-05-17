# Security Tradeoffs

These settings deviate from Azure hardening best practices. Each is an accepted tradeoff — the app is hosted on Railway, which has no Azure managed identity, making key-based auth the practical choice. Migration paths are noted if the hosting model changes.

## Storage Shared Key Access

`allowSharedKeyAccess` stays enabled.

The app uses connection-string auth (`BlobServiceClient.fromConnectionString`) and service SAS generation, both of which require shared key access:

- `packages/app/server/composables/azure/container/useContainerClient.ts`
- `packages/db/src/services/azure/container/generateUploadFileSasEntities.ts`
- `packages/db/src/services/azure/container/generateDownloadFileSasUrls.ts`
- `packages/app/server/trpc/routers/message/index.ts`
- `packages/app/server/trpc/routers/survey.ts`

Migration path: move to managed identity or user delegation SAS if the app gains an Entra-compatible identity.

## Storage Blob Public Access

`allowBlobPublicAccess` stays enabled.

`AppAssets`, `DungeonsAssets`, and `PublicUserAssets` are intentionally public for anonymous asset delivery. See `packages/db-schema/src/models/azure/container/AzureContainerPropertiesMap.ts`.

Migration path: move public assets behind signed URLs, CDN, or app-mediated delivery before disabling account-level public access.

## Azure Search Local Authentication

Search local authentication stays enabled.

The app uses `AzureKeyCredential` in `packages/app/server/composables/azure/search/useSearchClient.ts`.

Migration path: replace with an Entra credential or move the search call behind an Azure-hosted component with managed identity.

## Event Grid Topic Local Authentication

Event Grid local authentication stays enabled for the app path.

`packages/app/server/composables/azure/eventGrid/useEventGridPublisherClient.ts` uses `AzureKeyCredential`. Azure Functions already use `DefaultAzureCredential` and have the EventGrid Data Sender role assigned.

Migration path: replace the app publisher with an Entra credential path or route publishing through an Azure-hosted component.

## Web PubSub

Public client access, local authentication, and REST API access all stay enabled.

Browser clients connect from arbitrary public IPs — a static allowlist would block normal users. The app and Azure Functions use Web PubSub connection strings:

- `packages/app/server/composables/azure/webPubSub/useWebPubSubServiceClient.ts`
- `packages/db/src/services/azure/webPubSub/getWebPubSubServiceClient.ts`

Migration path: move server access to a non-key credential once the Railway identity story is resolved. Keep browser client public access separate from server-side hardening.

## Storage Network Rules

`networkRuleSet.defaultAction` stays `Allow`.

Switching to deny-all requires a complete allowlist of app, function, deployment, and admin source networks first. The app currently uses connection-string access with no private endpoint.

Migration path: identify all source networks, add private endpoints or access restrictions, then test all blob, table, and queue flows before tightening the default action.
