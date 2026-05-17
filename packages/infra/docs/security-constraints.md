# Security Constraints

This document records current application dependencies that block otherwise reasonable Azure security hardening changes.

Do not remove these constraints from the optimization plan until the referenced code paths have been migrated and verified with Pulumi preview plus application smoke testing.

Pulumi is the source of truth for Azure resources in this subscription. Existing RBAC grants should be imported as `Microsoft.Authorization/roleAssignments` resources with their live assignment GUIDs rather than recreated.

## Storage Shared Key Access

Do not set `allowSharedKeyAccess` to `false` yet.

Current dependency:

- `packages/app/server/trpc/routers/message/index.ts` exposes `generateUploadFileSasEntities` and `generateDownloadFileSasUrls`.
- `packages/app/server/trpc/routers/survey.ts` exposes `generateUploadFileSasEntities` and `generateDownloadFileSasUrls`.
- `packages/app/server/composables/survey/useUpdateBlobUrls.ts` regenerates read SAS URLs inside survey models.
- `packages/app/server/composables/azure/container/useContainerClient.ts` reads `runtimeConfig.azure.storageAccountConnectionString`.
- `packages/db/src/services/azure/container/getContainerClient.ts` creates the client with `BlobServiceClient.fromConnectionString(...)`.
- `packages/db/src/services/azure/container/generateUploadFileSasEntities.ts` and `generateDownloadFileSasUrls.ts` call `blockBlobClient.generateSasUrl(...)`.

Why this blocks the setting:

- Connection-string authentication depends on storage account keys.
- Service SAS generation from these clients depends on shared key credentials.
- Disabling shared key access before moving to managed identity or user delegation SAS would break message and survey asset upload/download flows.
- User delegation SAS still expires and cannot preserve the current long-lived read URL behavior without changing product flows.

Migration direction:

- Move server blob access to a non-key credential only after the hosting identity model is clear.
- Replace service SAS generation only when the replacement preserves existing expiry requirements or the consuming flows are redesigned.
- Verify all containers used by message and survey assets still support upload, read, clone, delete, and publish flows.

## Storage Blob Public Access

Do not set `allowBlobPublicAccess` to `false` yet.

Current dependency:

- `packages/db-schema/src/models/azure/container/AzureContainerPropertiesMap.ts` creates some containers with `{ access: "blob" }`.
- Current public blob containers are `AppAssets`, `DungeonsAssets`, and `PublicUserAssets`.

Why this blocks the setting:

- Disabling account-level blob public access would break anonymous blob reads from containers intentionally configured for public asset delivery.

Migration direction:

- Confirm which public containers are still product requirements.
- Move public assets behind signed URLs, CDN rules, or app-mediated delivery before disabling account-level public blob access.
- Keep message and survey asset SAS flows separate from public asset container behavior.

## Azure Search Local Authentication

Do not set Search local authentication to disabled yet.

Current dependency:

- `packages/app/server/composables/azure/search/useSearchClient.ts` creates `SearchClient` with `AzureKeyCredential`.
- `packages/app/server/services/message/searchMessages.ts` uses that client for message search.

Why this blocks the setting:

- Disabling local authentication makes key-based `AzureKeyCredential` requests fail.
- The main app is hosted on Railway and does not currently have an Azure managed identity.

Migration direction:

- Keep Search local authentication enabled while the Railway app uses `AzureKeyCredential`.
- If Search moves away from keys, use an explicit Railway-compatible Entra credential path or move the call behind an Azure-hosted component with managed identity.
- Assign the chosen identity the least-privilege Search role needed for query/index operations only after that code path exists.

## Event Grid Topic Local Authentication

Do not set Event Grid topic local authentication to disabled for the app path yet.

Current dependency:

- `packages/app/server/composables/azure/eventGrid/useEventGridPublisherClient.ts` creates `EventGridPublisherClient` with `AzureKeyCredential`.
- `packages/app/server/trpc/routers/message/index.ts` publishes push notification events after message creation.
- `packages/app/server/trpc/routers/friendRequest.ts` publishes friend request notification events.

Important nuance:

- `packages/azure-functions/src/services/eventGridPublisherClient.ts` already uses `DefaultAzureCredential`.
- The Azure Function identity already has EventGrid Data Sender grants in Azure; Pulumi should adopt those grants.
- The blocker is the main app server path, not the Azure Functions publisher path.

Why this blocks the setting:

- Disabling local auth on the Event Grid topic would break the app's key-based publishing until the app uses managed identity.
- The main app is hosted on Railway and does not currently have an Azure managed identity.

Migration direction:

- Keep Event Grid local authentication enabled while the Railway app publishes with `AzureKeyCredential`.
- If app publishing moves away from keys, use an explicit Railway-compatible Entra credential path or route publishing through an Azure-hosted component with managed identity.
- Assign EventGrid Data Sender only to identities that actually publish events.
- Remove key-based topic config only after app publishing is verified.

## Web PubSub Public Client Access

Do not restrict Web PubSub to a small static IP allowlist or private-only network while browser clients connect directly.

Current dependency:

- `packages/app/server/trpc/routers/message/index.ts` exposes `getWebPubSubClientAccessUrl`.
- That endpoint calls `webPubSubServiceClient.getClientAccessToken(...)` and returns a client URL for browser real-time connections.
- `packages/azure-functions/src/functions/processWebhook.ts` uses Web PubSub server-side fan-out for webhook messages.

Why this blocks the setting:

- Browser clients connect from arbitrary public IP addresses.
- A static allowlist or VNet-only policy would block normal public users unless the architecture changes.

Migration direction:

- Keep public client connection support while the product needs browser-to-WebPubSub connections.
- Review request types separately; trace and REST API exposure may be reducible without blocking browser clients.
- Consider private networking only if clients connect through an app-controlled relay or a supported private access design.

## Web PubSub Local Authentication And REST API

Do not disable Web PubSub local authentication or public REST API access yet.

Current dependency:

- `packages/app/server/composables/azure/webPubSub/useWebPubSubServiceClient.ts` reads the Web PubSub connection string from runtime config.
- `packages/db/src/services/azure/webPubSub/getWebPubSubServiceClient.ts` creates `WebPubSubServiceClient` from that connection string.
- `packages/app/server/trpc/routers/message/index.ts` uses the service client to create browser client access tokens.
- `packages/azure-functions/src/functions/processWebhook.ts` uses the service client for server-side message fan-out.

Why this blocks the setting:

- Connection-string authentication depends on local keys.
- Public REST API access is required while the app server and Azure Functions call Web PubSub service APIs over the public endpoint.
- The main app is hosted on Railway and does not currently have an Azure managed identity.

Migration direction:

- Move app and functions Web PubSub service access to a supported non-key flow only after the Railway app identity story is explicit.
- Confirm whether private networking is possible for server-to-service calls.
- Keep browser client public access separate from server REST API hardening.

## Storage Network Deny Rules

Do not set storage `networkRuleSet.defaultAction` to `Deny` without a complete allowlist.

Current resource state:

- `dshpstespauea001` has `defaultAction: Allow` plus one explicit IP rule.
- `pshpstespauea001` has `defaultAction: Allow` and no explicit IP rules.

Why this blocks the setting:

- Switching production to deny-all with no allowlist would lock out the app and functions from storage.
- The current app uses connection strings from server runtime config, not a private endpoint or managed identity-only path.

Migration direction:

- Identify all app, function, deployment, and local administration source networks.
- Add private endpoints or access restrictions deliberately.
- Test app upload, download, clone, delete, survey publish, and Azure Table flows before changing default action.
