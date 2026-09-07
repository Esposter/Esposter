---
title: Post images
description: Image attachments on posts through the file-upload standard.
---

# Post Images

Image attachments on the post create/update form, rendered as a grid on the feed card — technically a straight reuse of the file-upload standard (posts blob container, `files` metadata column, dropzone on the upsert form).

**Why deferred:** the feed is public, and public user-generated images are a content-moderation surface we have decided not to take on — there is no image moderation pipeline (profanity filtering covers text only), and the casual-platform trust level that is acceptable for room-scoped message uploads does not extend to a public feed. Content-related moderation for public surfaces is out of scope platform-wide.

**Revisit when:** the platform adopts an image/content moderation story (e.g. a scanning or review pipeline) that public surfaces can sit behind.
