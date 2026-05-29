# Optimization Review

This document records the completed phase-2 infrastructure optimization review of the imported Pulumi declarations.

Completed on 2026-05-29. Cost, network, identity, and retention changes were not applied in bulk; security-sensitive settings were checked against app and Azure Function usage before deciding whether to change them.

## Review Principles

- Preserve imported resource names unless a rename migration is explicitly planned.
- Keep `protect: true` on imported resources.
- Prefer reducing exposed surface area before reducing observability.
- Treat production and development changes separately in review notes, even while one Pulumi stack owns both.
- Avoid deleting resources until downstream app, Azure Function, Event Grid, and Logic App references have been checked.

## Priority Findings

| Priority | Area                         | Finding                                                                                            | Outcome                                                                                                                                                                                                                                               |
| -------- | ---------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Storage accounts             | Blob public access and shared key access are enabled. Public network access is enabled.            | Kept until app migrations remove the blockers; see [security-constraints.md](../../../packages/infra/docs/security-constraints.md). Blob versioning is disabled and 7-day soft delete is tracked in Pulumi.                                           |
| High     | Web PubSub                   | Public network is enabled. Trace access was imported as public.                                    | Kept unchanged on `Free_F1`; Azure rejects network ACL changes for that SKU. Do not use static IP allowlists, disable local auth, or remove REST API access yet; see [security-constraints.md](../../../packages/infra/docs/security-constraints.md). |
| High     | Logic Apps and action groups | Action groups invoke Logic Apps that start/stop Function Apps and delete/recreate Event Grid subs. | Existing managed identities have scoped Website Contributor or EventGrid EventSubscription Contributor assignments. Callback URL rotation remains an operational task because HTTP trigger signatures are external secrets.                           |
| High     | Function Apps                | Public network access is enabled. Apps use system-assigned identity on Dynamic Y1 plans.           | Kept public access while Event Grid and HTTP webhook entry points require reachability. Managed identity has storage and Event Grid data sender roles. App settings/deployment source are not fully represented in Pulumi.                            |
| Medium   | Log Analytics                | Retention is 30 days, but daily quota is unlimited (`-1`).                                         | Kept unlimited until ingestion baselines are measured. Add caps later per environment rather than guessing.                                                                                                                                           |
| Medium   | Application Insights         | Retention is 90 days and linked to Log Analytics. Public ingestion/query are enabled.              | Kept public ingestion/query because current Functions/App Insights access path is not private. Retention is acceptable for the minimal pass.                                                                                                          |
| Medium   | Event Grid subscriptions     | Retry policy allows 30 delivery attempts and 24-hour TTL.                                          | Kept retry policy. Added missing dev/prod subscriptions for `ProcessFriendRequestNotification`; dead-letter destinations remain deferred until a storage target and replay process are chosen.                                                        |
| Medium   | Event Grid topic             | Topic local auth is enabled.                                                                       | Kept local auth until the main app Event Grid publisher no longer uses `AzureKeyCredential`; see [security-constraints.md](../../../packages/infra/docs/security-constraints.md).                                                                     |
| Medium   | Budgets                      | Budget amount is `0.01` with automated action groups.                                              | Confirmed as automated test/guard budgets, not real operating limits. Development and production currently share the same behavior.                                                                                                                   |
| Low      | Cognitive Search             | Free SKU, one replica, one partition, public network enabled, local auth enabled.                  | Kept SKU and auth posture. Do not disable local auth until app Search moves off `AzureKeyCredential`; see [security-constraints.md](../../../packages/infra/docs/security-constraints.md).                                                            |
| Low      | Speech Services              | Imported Speech Services resource had a legacy `Application: Eslife` tag.                          | No Speech Services Pulumi resource remains in the current tracked declarations; shared `ApplicationTags` now use `Esposter`.                                                                                                                          |

## Current Security Constraints

Some hardening suggestions are valid end goals but unsafe as immediate Pulumi changes because the app still depends on key-based Azure SDK clients or public browser access.

Recorded constraints:

- Storage shared key access must stay enabled until blob clients and SAS generation migrate away from connection-string/shared-key auth.
- Storage account blob public access must stay enabled until public blob containers are migrated.
- Azure Search local auth must stay enabled until the app replaces `AzureKeyCredential` with managed identity.
- Event Grid local auth must stay enabled for the app path until the app publisher replaces `AzureKeyCredential` with managed identity. Azure Functions already use `DefaultAzureCredential`.
- Web PubSub must keep public browser client access while clients connect directly from arbitrary IPs.
- Web PubSub local auth and REST API access must stay enabled while app and function service clients use connection-string access over public endpoints.
- Storage network default deny must wait for a complete allowlist, private endpoint, or identity/network migration.

See [security-constraints.md](../../../packages/infra/docs/security-constraints.md) for code paths and migration direction.

## Resource Category Checklist

### Storage

- [x] Check whether blob public access is required. Current public asset containers use blob-level anonymous access.
- [x] Check whether shared key access is required by app or functions. Current app blob and SAS flows require it.
- [x] Check whether blob and container soft delete are tracked. Both are enabled for 7 days and managed in Pulumi.
- [x] Check whether blob versioning can be disabled. Disabled because app code does not use blob versions and previous versions can add storage cost.
- [x] Check whether `defaultToOAuthAuthentication` can be enabled. Keep disabled while app storage clients and SAS flows use shared-key connection strings.
- [x] Check whether public network access can be restricted. Do not switch storage to deny-by-default until production has a complete allowlist or private access path.
- [x] Confirm lifecycle management, soft delete, versioning, and backup expectations for the minimal pass.
- [x] Confirm `Standard_LRS` is acceptable for the current minimal production posture.

### Web PubSub

- [x] Confirm whether Free F1 is sufficient for both environments. Kept for the minimal pass; upgrade only if connection, message, or unit limits are observed.
- [x] Check if trace access should be removed from public ACLs. Skipped while Web PubSub remains on `Free_F1` because Azure rejects network ACL changes for that SKU.
- [x] Check if REST API access can be limited. Keep for now because app/functions use service clients over public endpoint.
- [x] Confirm whether local auth can be disabled. Keep for now because app/functions use Web PubSub connection strings.
- [x] Confirm whether client and server connection access can be narrowed. Browser clients require public client access; server-side hardening waits for a non-connection-string service client path.

### Function Apps

- [x] Identify the actual hosting plans referenced by `serverFarmId`. Dev and prod functions reference `dev-asp-esposter-ae-001` and `prod-asp-esposter-ae-001`, both Dynamic Y1 Function App plans.
- [x] Confirm whether development and production should share the same hosting pattern. Both are on the same Dynamic Y1 pattern for now.
- [x] Review inbound public access and possible access restrictions. Keep public access while Event Grid triggers and the HTTP `PushWebhook` endpoint need reachability.
- [x] Review managed identity permissions. Function identities have Event Grid Data Sender plus Storage Blob, Queue, and Table Data Contributor roles.
- [x] Confirm deployment source and runtime settings are represented in Pulumi. Not fully represented; app settings/deployment configuration remain external to these imported `WebApp` declarations.
- [x] Confirm Application Insights linkage is intentional and complete. App Insights resources exist and are Log Analytics-backed, but Function App app-setting linkage is not represented in Pulumi.

### Logic Apps And API Connections

- [x] Map each workflow to its business purpose. `001` stops Function Apps, `002` starts Function Apps, `003` deletes Event Grid subscriptions, and `004` recreates Event Grid subscriptions.
- [x] Verify each API connection is still required. Azure App Service connections support start/stop workflows; Azure Resource Manager connections support Event Grid subscription repair workflows.
- [x] Confirm managed identity permissions for control-plane operations. Logic App identities have Website Contributor or EventGrid EventSubscription Contributor scopes matching their workflows.
- [x] Rotate or reissue callback URLs if they were exposed during migration. Treat as an operational secret-rotation task; no Pulumi-safe inline rotation was applied.
- [x] Check whether repeated start/stop/delete workflows can be simplified. Kept unchanged because budgets still target those action groups.

### Budgets And Action Groups

- [x] Confirm each budget scope and filtered resource ID. Budgets are scoped to environment resource groups; `001` also filters by the Event Grid topic resource ID.
- [x] Confirm threshold amounts are intentional. Amounts remain `0.01`, so these are test/guard budgets rather than real operating caps.
- [x] Confirm automated stop/delete actions are still desired. Kept because the current budgets still route to start/stop and Event Grid subscription delete/recreate action groups.
- [x] Verify action group receivers are least-privilege and still reachable. Receivers target environment-specific Logic Apps; their identities are scoped to the relevant resource group/topic operations.
- [x] Decide whether development and production need different budget behavior. No divergence was added in this pass.

### Event Grid

- [x] Confirm each event subscription destination function. Existing subscriptions target `ProcessWebhook` and `ProcessPushNotification`; this pass added missing dev/prod subscriptions for `ProcessFriendRequestNotification`.
- [x] Confirm included event type names are still used by the application. App and function code publish/handle `ProcessWebhook`, `ProcessPushNotification`, and `ProcessFriendRequestNotification`.
- [x] Review retry attempts and TTL. Kept 30 attempts and 24-hour TTL.
- [x] Decide whether dead-letter destinations are needed. Deferred until a dead-letter storage target and replay process are designed.
- [x] Check filters after any app event naming changes. Filters now cover all currently published Event Grid function event types.

### Observability

- [x] Set Log Analytics daily caps after measuring ingestion. Deferred because no ingestion baseline was available; keep `dailyQuotaGb: -1` until measured.
- [x] Confirm retention for development and production. Log Analytics is 30 days and Application Insights is 90 days for both environments.
- [x] Confirm public query and ingestion access posture. Kept enabled for the current public/non-private access posture.
- [x] Review Application Insights sampling and ingestion volume. No sampling settings are represented in Pulumi; review after ingestion baselines exist.
- [x] Check whether diagnostic settings are missing for key resources. No diagnostic settings are currently declared; add selectively in a future observability pass once sinks and retention expectations are chosen.

### Low-Hanging First Pass

- [x] Review public Web PubSub Trace access. Skipped while Web PubSub remains on `Free_F1`.
- [x] Correct Speech Services `Application` tag from `Eslife` to `Esposter`. No tracked Speech Services resource remains; shared application tags use `Esposter`.

## Changes Made During This Pass

- Added `dev-evgs-esposter-ae-003` for `ProcessFriendRequestNotification`.
- Added `prod-evgs-esposter-ae-003` for `ProcessFriendRequestNotification`.
- Ran `pnpm infra:preview --suppress-outputs`; Pulumi reported `95 unchanged`.

## Follow-Up Candidates

- Measure Log Analytics and Application Insights ingestion before setting daily caps or sampling.
- Move Function App runtime settings and App Insights connection settings into Pulumi if this package should become the complete source of truth.
- Design Event Grid dead-letter storage and replay before enabling dead-letter destinations.
- Rotate Logic App callback URLs if migration artifacts exposed live callback signatures.
