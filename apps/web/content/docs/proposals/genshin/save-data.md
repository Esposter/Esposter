---
title: Save Data
description: Proposal — what is left of the Genshin world's save: the remaining systems' slices, the Clicker and Dungeons opt-in to the shared If-Match, and the lease's move onto the shared blob-state procedures. The save blob, its lease, the client's hydration, autosave, guest merge and replaced signal are built.
model: claude-haiku-5-5
---

# Save Data

The save blob, its lease, the client's hydration and autosave, the guest's merge on sign-in and the replaced signal are built as [save data](/docs/genshin/save-data) describes. What is left is the slices of the systems the world holds but the save does not yet, and the shared blob-state path the lease was meant to move onto.

## Decisions

- **Each remaining system adds its slice in the change that wires it.** The bag, Adventure Rank, the achievements, the wish counters, reputation and companionship each take a slice beside their model, composed into the save with a default in `EMPTY_GENSHIN_SAVE` and a merge rule in `mergeGenshinSave`. A set whose entries paid into the wallet or the bag (the opened chests, the collected items) merges as the account's copy with the wallet and the bag, never by union, since a union would keep a guest's opened chest while the account's wallet drops what it paid, and the chest could never pay again. The bag's and the wish's types live in `genshin-interface`, which the server does not import, so each gets a `genshin-interface/save` subpath export of the same shape as `genshin-world/save`.
- **Clicker and Dungeons opt in to If-Match, not the lease.** Their saves are one document with no session, so the conditional write is the only guard they need.

## Left to build

- The slices of the bag, Adventure Rank, the achievements, the wish counters, reputation and companionship, and the `genshin-interface/save` subpath those two wait on.
- The lease and If-Match moved into the shared blob-state procedures (`createSaveBlobStateProcedure`, `createReadBlobStateProcedure`) as an opt-in, so Genshin's start and save use the shared path. The read procedure returns the model directly, so If-Match needs the blob's ETag returned beside it, which changes the clicker and dungeons read contracts and their clients.
- The Clicker and Dungeons If-Match opt-in, one commit each.
