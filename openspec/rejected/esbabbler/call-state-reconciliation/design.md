# Call State Reconciliation

A live call's participants, knockers and start time are kept in its `CallObject`'s storage, which outlives the object going idle and a web Worker redeploy ([calls](../../../specs/esbabbler/calls/README.md) describes what that storage holds). The idea was to rebuild the call maps after a restart, from RealtimeKit's own participant list, or to close every room on boot so each client rejoins.

**Why not**

- The restart it rebuilds from no longer loses anything. The picture is durable in the call's object, and media never crosses the Workers, so a redeploy leaves a live call and its participants where they were.
- Closing rooms on boot would interrupt every live call on every deploy, to repair a loss that no longer happens.
