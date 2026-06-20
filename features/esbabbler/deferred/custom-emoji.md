# Custom Emoji / Stickers Per Room

Per-room upload of custom emoji/stickers to Azure Blob (reusing the SAS upload flow), with a small lookup table for resolution.

## Why deferred

- Ongoing Azure Blob storage cost per room.
- A medium feature build: a new room-emoji table, upload UI, and picker + render integration (the reaction system already keys on a string `emojiTag`).

## What already exists

The "needs moderation tooling" blocker is largely answered — RBAC, the word filter, and the moderation log are all shipped, and the SAS upload flow (`generateProfileImageUploadUrl`) + blob containers already exist.

## Revisit when

Rooms want identity/branding badly enough to justify the per-room blob cost and the feature build.
