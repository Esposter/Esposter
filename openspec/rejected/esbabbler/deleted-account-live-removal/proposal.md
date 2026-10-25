# Deleted account's removals announced live

## Why

Rejected. When an account is deleted, the account sweep removes its messages and reactions from shared rooms in the database, and an open room keeps drawing them until a reload. The idea was to publish each removal to the room group, so open views drop them at once.

The owner left the call to the session, and the session decided against it. Once the sweep commits, the data is already gone, so a live announcement would only correct a view that the next load corrects anyway. That does not justify a new event for the client to handle.

How it would have worked is in the [design](design.md).
