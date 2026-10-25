# Reaction removal announced live

## What it would have been

The account sweep would publish each reaction it removes from a shared room to that room's Web PubSub group. The emoji store in the web app would then drop the reaction, or the account's id from it, on receipt. The functions host has to publish, because it cannot reach the in-process emitter that carries reaction changes inside the web app.

## Why it loses

- A removal made by the sweep would reach open views by a second route, Web PubSub, that no other reaction change takes.
- It adds a client event and its handling for one case: an account deleted while someone has its room open.
- The reaction is already out of storage when the event is sent, so the event only corrects a view that a reload corrects too.
