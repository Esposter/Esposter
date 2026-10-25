# Reaction removal announced live

## Why

Rejected. The account sweep takes a deleted account's reactions out of shared rooms in the database, and an open room keeps drawing a removed reaction until its next load. The idea was to publish each removal to the room group, so open views drop it at once.

The owner decided against it. Once the sweep commits, the reaction's data is already gone, so a live announcement would only correct a mark on a screen that corrects itself on reload. That does not justify a new event for the client to handle.

How it would have worked is in the [design](design.md).
