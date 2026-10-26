# Data export

## Why

A person who uses the platform has a right to a copy of what the platform holds about them, and the same trigger that opens [account deletion](../../specs/user/account-deletion/design.md) opens this one: external people use the platform now. Export is also the check on deletion, since both need the same complete list of user-owned data, which the [user data inventory](../../specs/architecture/user-data-inventory/design.md) keeps.

## What Changes

- A settings flow, **Download my data**, that requests an archive and then offers it for download while it is current.
- A request that is queued, not built inside the request, because an archive of a large account cannot finish inside one. One active export per person at a time.
- A background handler that streams the archive into a private blob, so no full copy is ever held in memory, and records where it is.
- A download link that is short-lived, issued only to the owner, and refused after the archive's own expiry.
- A private container for archives, expired by a lifecycle rule.

## Impact

- `packages/db-schema`: a `dataExports` table and the event type.
- `apps/web`: the request, status and link procedures, and the settings flow.
- `apps/functions`: the archive build and the function that starts it.
- `apps/infra`: the container, its lifecycle rule and the event subscription, in both environments.
- Not included, as the [account deletion spec](../../specs/user/account-deletion/spec.md) states: other people's messages, the shared character-pack files, and messages in rooms the person has left.
