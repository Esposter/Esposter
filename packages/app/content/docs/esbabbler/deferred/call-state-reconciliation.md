---
title: Call state reconciliation
description: Deferred — rebuilding the in-memory call maps after a restart, so a call that outlives a deploy keeps working.
---

# Call State Reconciliation

The ephemeral call maps are module-level and lost on restart, while the calls themselves are not: LiveKit is an external SFU, so participants stay connected through a deploy and only this side's picture of them goes ([calls](/docs/esbabbler/calls) describes what that costs them). Reconciliation would restore the picture — ask LiveKit who is actually in each room through `RoomServiceClient` and rebuild the maps from the answer, or close the rooms on boot and make every client rejoin.

**Why deferred**

- The rebuild needs a trigger, and a poll is the wrong one — there is a listing to call but nothing native that fires on "this process just lost its state", and asking on a timer is exactly what [no polling](/docs/architecture/no-polling) rules out.
- Closing the rooms on boot is a visible interruption to every live call, paid on every deploy, for a state loss that costs nothing while nobody is in a call.

**Revisit when:** calls run long enough, and deploys land often enough, that a call routinely spans one.
