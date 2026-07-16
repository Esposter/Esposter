---
title: Account deletion self-service
description: A user-initiated delete-my-account flow with full data cleanup.
---

# Account Deletion Self-Service

A settings-page flow deleting the account and its data: the Postgres cascade (every user-referencing table already declares `onDelete: cascade`) plus the non-relational tail — save blobs, uploaded assets, Azure Table messages, push subscriptions.

**Why deferred:** The relational part is one delete, but doing it _honestly_ requires sweeping the blob containers and message tables, and deciding what happens to rooms the user owns — design that only matters once strangers use the platform. Building it early risks a half-clean delete that looks compliant but isn't.

**Revisit when:** the platform opens to real external users (data-rights obligations attach), or the first genuine deletion request arrives — whichever comes first.
