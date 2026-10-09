---
title: Save Data
description: Proposal — what is left of the Genshin world's save: the client's hydration and autosave, the guest's upload on sign-in, the replaced signal to the old session, the remaining systems' slices, and the Clicker and Dungeons opt-in to the shared lease. The save blob, its lease and its bounds are built.
model: claude-haiku-5-5
---

# Save Data

The save blob, the session lease and the slice schemas are built as [save data](/docs/genshin/save-data) describes. What is left is everything that moves the world's state into and out of that save, and the signal that tells the game it was taken elsewhere.

## Decisions

- **Hydrate, then autosave.** The world loads its systems from the save the start returns, and derives what the save does not hold. A deliberate change, a grant or a purchase, is saved at once, as Clicker splits its immediate save from its autosave. Everything else is saved on a periodic autosave, and `visibilitychange` to hidden flushes it.
- **The client keeps the server's clock offset.** Each start and save answers with the server's now, and the client takes the offset from the first of them. Original Resin's regeneration, daily resets and respawn timers are read against that offset, never the client's own clock.
- **A replaced session hears it at once and on its next write.** The start emits a "replaced" event to the old session through the in-process real-time layer, which is the one [the real-time architecture](/docs/architecture/azure-services) gives a per-user signal written by one server process. A rejected write is the fallback. Either way the old session stops autosaving, pauses the world, and shows "logged in elsewhere" with a way to take the session back, which starts a new lease and reloads the save.
- **A guest's save is uploaded on sign-in.** Signed out, the save lives in localStorage under the same schema through `useSave`'s unauthenticated path. On sign-in it is uploaded when the account has none. When the account has one, a pure merge takes both: grow-only sets (opened, unlocked, collected) by union, monotonic counters and levels by maximum, and everything else the account's copy. Clicker and Dungeons gain the same merge in their own commits, each over its own fields.
- **The world's rules stay pure.** Each reward and grant is a function of the save and the time, so moving it to the server is a call to the same function there. That move is made when a shared or competitive feature needs the server to grant, and until then the client is authoritative and the server validates shape and bounds only.
- **Each remaining system adds its slice in the change that wires it.** The bag and wallet's items, the Adventure Rank and EXP, the achievements' counters, the waypoints' unlocks beyond the landmarks, reputation and companionship where they hold state, and the wish counters. The bag's slice needs the game's item categories and the wish's needs its banner kinds at the save's entry, and those enums live in `genshin-interface`, which the server does not import yet. Those two wait on a subpath export of their own, which is a small change of the same shape as `genshin-world/save`.
- **Clicker and Dungeons opt in to the lease and the ETag as separate commits**, so their save procedures gain the lease and the conditional write with their tests kept green.

## Left to build

- The client: a composable that hydrates the world's slices from the start's save, autosaves and flushes on hidden, and takes the server's clock offset.
- The replaced signal and the "logged in elsewhere" state with its take-back, on the in-process real-time layer and the rejected write.
- The guest's localStorage save under the save schema, its upload on sign-in and the pure merge.
- The slices of the bag, the wallet's items, the Adventure Rank, the achievements, the wish counters, reputation and companionship, each with its enum's subpath export where it needs one.
- The Clicker and Dungeons opt-in, one commit each.
