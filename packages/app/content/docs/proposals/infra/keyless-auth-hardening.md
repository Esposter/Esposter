---
title: Keyless auth hardening
description: Proposal — move the app off key-based Azure auth, then disable shared-key/local auth estate-wide.
---

# Keyless Auth Hardening

The blocked security-hardening wave: disable storage shared-key access, blob public access, and Search/Event Grid local auth, and set storage network default-deny. Every switch is held open by an app code path using key-based auth — this proposal is the app-side migration that unblocks them.

## Scope

**Today:** Azure Functions already use `DefaultAzureCredential` with least-privilege roles; the Railway-hosted app authenticates to Storage/Search/Event Grid/Service Bus with keys and connection strings (`packages/infra/docs/azure/security-constraints.md` maps each blocker).

**This adds**, per service, in order:

1. **Inventory** — enumerate every key-based client construction in `packages/app/server` + `packages/db` against the constraints doc.
2. **Credential path** — Railway has no Azure managed identity, so the app uses a **service principal** (client id/secret via env) with the same least-privilege role assignments pattern already proven for Functions; SAS issuance moves to user-delegation SAS where storage keys are disabled.
3. **Flip the switches in Pulumi** one service at a time (Search local auth → Event Grid local auth → storage shared-key → blob public access → network default-deny), smoke-testing the affected feature between each.

## Key files

| File                                                          | Change                               |
| :------------------------------------------------------------ | :----------------------------------- |
| `packages/db/src/` + `packages/app/server/composables/azure/` | credential-based client construction |
| `packages/infra/src/azure/`                                   | role assignments + auth switches     |
| `packages/infra/docs/azure/security-constraints.md`           | tick off each unblocked constraint   |

## Notes

User-delegation SAS is the hard part — message-attachment and survey uploads depend on SAS ([/docs/architecture/file-uploads](/docs/architecture/file-uploads)); verify expiry limits (user-delegation keys cap at 7 days) fit the upload flow before flipping shared-key off. Every SAS now fits: resource asset reads sign a minutes-scale SAS per request through `/api/resource-assets`, message-attachment reads default to a day, and upload SAS urls are hour-scale — nothing signs past the 7-day cap.
