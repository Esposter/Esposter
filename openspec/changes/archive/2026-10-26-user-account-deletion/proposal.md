# Account deletion

## Why

A signed-in person can leave the platform only by stopping, and nothing removes what they left behind. The deferral of this flow named its own trigger: the platform opens to real external users, or the first genuine deletion request arrives. The first half has fired. Anonymous browsing, public profiles and social sign-in are shipped, so people who are not the owner use the platform, and data-rights obligations attach to them now. The gap survey recorded the same reading.

## What Changes

- A settings flow, **Delete account**, behind a typed confirmation. It revokes every session the account holds and starts the deletion.
- A deletion marker on the user row and an Event Grid event, the same persist-then-notify shape rooms and resource purges use. The mutation returns once the marker is written.
- An idempotent Functions handler that sweeps every store the [user data inventory](../../../specs/architecture/user-data-inventory/design.md) lists as user-keyed, and deletes the user row last, so a failed sweep leaves the account in place and retryable.
- The `accounts` foreign key cascades, so the user row can be deleted at all.
- Owned rooms are deleted the way an owner's departure already deletes them, and their message partitions and attachments are swept too, which the room deletion did not do.

## Impact

- `packages/db-schema`: the `accounts` cascade, and a deletion marker on `users`. A migration, generated and then checked by hand.
- `apps/web`: the mutation, the shared soft-delete and blob helpers moved into `packages/db`, and the settings flow.
- `apps/functions`: the handler and its event registration.
- `apps/infra`: the event subscription for the new event type in both environments.
- Not covered, and named in the spec: messages in rooms the user has left, the shared character-pack files, the moderation and activity records that name the user, and the search index's copy of message text. Each is an explicit limit, not a silent gap.
