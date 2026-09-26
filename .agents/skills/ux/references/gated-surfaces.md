# Gated Surfaces

Read when a panel, tab or menu entry sits behind a permission or ownership gate.

A panel, tab or menu entry whose every control is rejected server-side is worse than a missing one: the reader
finds the thing they were looking for and then cannot use it, and the error arrives from a read they never asked
for. So a surface listed behind a permission gate carries **the permission its own writes require**, and the gate
on the container is the **union of what it holds** rather than a second list beside it — otherwise a reader who
may manage exactly one thing cannot reach the surface that manages it.

Where the guard is ownership rather than a permission, the entry is gated on ownership; a confirm dialog that
refuses afterwards is not the gate, it is the second one.

**Prime example — room settings.** Every panel except the reader's own profile names a `RoomPermission`, the
dialog's own gate is derived from that map, and Delete is drawn only for the room owner, because deleting is
guarded by `ownedBy` and no permission can express it.
