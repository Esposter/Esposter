---
title: Data export self-service
description: A download-my-data flow bundling a user's relational rows, messages, and blobs into one archive.
---

# Data Export Self-Service

A settings-page flow producing a downloadable archive of everything the account owns: the Postgres rows (profile, rooms, posts, settings), Azure Table messages, and blob content (resource working copies, uploaded assets) — the read-only sibling of [account deletion](/docs/users/deferred/account-deletion).

**Why deferred:** Same shape as account deletion — the relational part is a handful of queries, but an honest export must sweep every blob container and message partition the user touches, needs a background job + temporary download link (an archive won't build inside a request), and drives no decision until data-rights obligations attach. Building it early risks a partial export that looks compliant but isn't.

**Revisit when:** the platform opens to real external users (data-rights obligations attach), or the first genuine export request arrives — and design it together with [account deletion](/docs/users/deferred/account-deletion), since both need the same complete inventory of user-owned data.
