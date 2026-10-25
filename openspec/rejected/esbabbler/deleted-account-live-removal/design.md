# Deleted account's removals announced live

## What it would have been

The account sweep would publish each message and reaction it removes from a shared room to that room's Web PubSub group. The client would then drop them on receipt: the messages from the room's list, and the account's id from each reaction. The functions host has to publish, because it cannot reach the in-process emitter that carries live changes inside the web app.

## Why it loses

- A removal made by the sweep would reach open views by a second route, Web PubSub, that no other change in the room takes.
- It adds a client event and its handling for one case: an account deleted while someone has its room open.
- The data is already out of storage when the event is sent, so the event only corrects a view that a reload corrects too.
