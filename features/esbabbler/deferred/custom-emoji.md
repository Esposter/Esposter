# Custom Emoji / Stickers Per Room

Per-room upload of custom emoji/stickers to Azure Blob (reusing the SAS upload flow), with a small lookup table for resolution.

## Why deferred

- Ongoing Azure Blob storage cost per room.
- Needs moderation tooling for uploaded image content.
- Low ROI relative to that complexity on a casual platform.

## Revisit when

Rooms want identity/branding badly enough, and there is content-moderation tooling in place to govern uploads.
