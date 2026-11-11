# Laser pointer

A laser tool that leaves a fading trail under the pointer, which the other people viewing the board see.

## Why deferred

A laser is shown to everyone on the board, so it is live state, sent as the pointer moves. The whiteboard has no live patches between editors: it autosaves its own document ([whiteboard](../../../specs/resource/whiteboard/design.md)). The only presence the app carries is a user's status, pushed as a subscription ([profiles and presence](../../../specs/esbabbler/profiles-and-presence/design.md)), and no record specifies a channel a board holds for its viewers' pointers. The [document collaboration](../document-collaboration/design.md) record covers sharing with specific users, roles and ACLs, and concurrent editing, and never mentions presence, so the laser has no specified channel to send its trail over.

**Revisit when:** a live presence channel is specified in a record of its own and built, which gives a board a live channel.
