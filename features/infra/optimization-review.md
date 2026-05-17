# Optimization Review

This document tracks phase-2 infrastructure optimization candidates found in the imported Pulumi declarations.

Ordered implementation roadmaps live in `v1.md`, `v2.md`, `v3.md`, `v4.md`, `v5.md`, and `v6.md`.

Do not apply cost, network, identity, or retention changes in bulk. Change one resource category at a time and require a clean `pnpm infra:preview` before `pnpm infra:up`.

## Review Principles

- Preserve imported resource names unless a rename migration is explicitly planned.
- Keep `protect: true` while reviewing optimization changes.
- Prefer reducing exposed surface area before reducing observability.
- Treat production and development changes separately in review notes, even while one Pulumi stack owns both.
- Avoid deleting resources until downstream app, Azure Function, Event Grid, and Logic App references have been checked.

## Priority Findings

| Priority | Area                         | Finding                                                                                                 | Candidate Action                                                                                                                                                                                                         |
| -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| High     | Storage accounts             | Blob public access and shared key access are enabled. Public network access is enabled.                 | Do not disable blob public access, shared key, or deny network by default yet; see [security-constraints.md](security-constraints.md).                                                                                   |
| High     | Web PubSub                   | Public network is enabled and ACLs allow `0.0.0.0/0` and `::/0`. Trace access was imported as public.   | Keep unchanged on `Free_F1`; Azure rejects network ACL changes for that SKU. Do not use static IP allowlists, disable local auth, or remove REST API access yet; see [security-constraints.md](security-constraints.md). |
| High     | Logic Apps and action groups | Action groups depend on secret callback URLs and Logic Apps perform control-plane operations.           | Verify callback URL rotation, secret storage, managed identity permissions, and least-privilege RBAC.                                                                                                                    |
| High     | Function Apps                | Public network access is enabled. App has system-assigned identity, but storage is marked not required. | Confirm hosting model, inbound requirements, managed identity permissions, and whether access restrictions are possible.                                                                                                 |
| Medium   | Log Analytics                | Retention is 30 days, but daily quota is unlimited (`-1`).                                              | Add a daily cap after measuring normal ingestion.                                                                                                                                                                        |
| Medium   | Application Insights         | Retention is 90 days and linked to Log Analytics. Public ingestion/query are enabled.                   | Confirm retention requirements and whether query/ingestion restrictions are viable.                                                                                                                                      |
| Medium   | Event Grid subscriptions     | Retry policy allows 30 delivery attempts and 24-hour TTL.                                               | Confirm retry tolerance and dead-letter strategy for webhook and push events.                                                                                                                                            |
| Medium   | Event Grid topic             | Topic local auth is enabled.                                                                            | Do not disable local auth until the main app Event Grid publisher no longer uses `AzureKeyCredential`; see [security-constraints.md](security-constraints.md).                                                           |
| Medium   | Budgets                      | Budget amount is `0.01` with automated action groups.                                                   | Confirm whether budgets are real guards, tests, or placeholders before relying on them operationally.                                                                                                                    |
| Low      | Cognitive Search             | Free SKU, one replica, one partition, public network enabled, local auth enabled.                       | Keep SKU if free is enough. Do not disable local auth until app Search moves off `AzureKeyCredential`; see [security-constraints.md](security-constraints.md).                                                           |
| Low      | Speech Services              | Free SKU, public network enabled, tag uses `Application: Eslife`.                                       | Confirm whether the resource is still used and fix tag alignment if retained.                                                                                                                                            |

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

See [security-constraints.md](security-constraints.md) for code paths and migration direction.

## Resource Category Checklist

### Storage

- [x] Check whether blob public access is required. Current public asset containers use blob-level anonymous access.
- [x] Check whether shared key access is required by app or functions. Current app blob and SAS flows require it.
- [ ] Check whether `defaultToOAuthAuthentication` can be enabled.
- [x] Check whether public network access can be restricted. Do not switch storage to deny-by-default until production has a complete allowlist or private access path.
- [ ] Confirm lifecycle management, soft delete, versioning, and backup expectations.
- [ ] Confirm `Standard_LRS` is acceptable for production recovery requirements.

### Web PubSub

- [ ] Confirm whether Free F1 is sufficient for both environments.
- [x] Check if trace access should be removed from public ACLs. Skipped while Web PubSub remains on `Free_F1` because Azure rejects network ACL changes for that SKU.
- [x] Check if REST API access can be limited. Keep for now because app/functions use service clients over public endpoint.
- [x] Confirm whether local auth can be disabled. Keep for now because app/functions use Web PubSub connection strings.
- [x] Confirm whether client and server connection access can be narrowed. Browser clients require public client access; request types still need review.

### Function Apps

- [ ] Identify the actual hosting plans referenced by `serverFarmId`.
- [ ] Confirm whether development and production should share the same hosting pattern.
- [ ] Review inbound public access and possible access restrictions.
- [ ] Review managed identity permissions.
- [ ] Confirm deployment source and runtime settings are represented in Pulumi.
- [ ] Confirm Application Insights linkage is intentional and complete.

### Logic Apps And API Connections

- [ ] Map each workflow to its business purpose.
- [ ] Verify each API connection is still required.
- [ ] Confirm managed identity permissions for control-plane operations.
- [ ] Rotate or reissue callback URLs if they were exposed during migration.
- [ ] Check whether repeated start/stop/delete workflows can be simplified.

### Budgets And Action Groups

- [ ] Confirm each budget scope and filtered resource ID.
- [ ] Confirm threshold amounts are intentional.
- [ ] Confirm automated stop/delete actions are still desired.
- [ ] Verify action group receivers are least-privilege and still reachable.
- [ ] Decide whether development and production need different budget behavior.

### Event Grid

- [ ] Confirm each event subscription destination function.
- [ ] Confirm included event type names are still used by the application.
- [ ] Review retry attempts and TTL.
- [ ] Decide whether dead-letter destinations are needed.
- [ ] Check filters after any app event naming changes.

### Observability

- [ ] Set Log Analytics daily caps after measuring ingestion.
- [ ] Confirm retention for development and production.
- [ ] Confirm public query and ingestion access posture.
- [ ] Review Application Insights sampling and ingestion volume.
- [ ] Check whether diagnostic settings are missing for key resources.

### Low-Hanging First Pass

- [x] Review public Web PubSub Trace access. Skipped while Web PubSub remains on `Free_F1`.
- [x] Correct Speech Services `Application` tag from `Eslife` to `Esposter`.

## Change Order

1. Run `pnpm infra:preview` with the current code and record whether it is clean.
2. Review security-sensitive public access settings without changing them.
3. Review cost-sensitive quotas, SKUs, and retention settings.
4. Change one resource category at a time.
5. Run `pnpm infra:preview` after each category change.
6. Apply only after preview output is understood.
