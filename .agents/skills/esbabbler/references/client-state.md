# Store mutations

Read when a component mutates messaging state, and whether that belongs in a store at all.

## Subscriptions are the source of truth

A subscription that echoes a write — most room, message, friend and role actions — delivers its state change to **every** subscribed client, the caller included, so a store function never repeats what that echo will do. The caller runs the write through its own `useMutation`, and a store action exists only for what a subscription cannot do — whether one is earned is the `pinia` skill's (`references/mutation-actions.md`). The message send is the one optimistic flow outside `useMutation`, and why is `openspec/specs/architecture/client-data/design.md` ("When not to use them").
