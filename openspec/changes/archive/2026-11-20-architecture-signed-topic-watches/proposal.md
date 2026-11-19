# Signed topic watches

## Why

A tab watches a query's topics by sending a `watch` frame up its user socket, and the topic's object subscribes the person to them. Nothing checks that the person may read a topic. A signed-in person can therefore watch `room/<any id>:messages:*`, or the kind-wide `room/*:<table>:*`, and learn when writes land in rooms they are not in. The frames carry only topic names, so the leak is timing, not data, but it is a leak any signed-in person can use.

## What changes

The read is the authorisation. A query's answer already names the topics it was read from, so the server signs them for the person who asked, and the socket subscribes only what a signature covers:

- The web Worker signs each signed-in query's topics, one signature per read, over the person's id, the time the read began and the topics with their columns. The signature rides the response header beside the topics.
- The client sends a watch frame carrying one read's signature, its time and its topics, unchanged.
- The user object verifies the signature against its person before it subscribes, and refuses a frame whose topics the signature does not cover, whose signature does not match, or whose read began more than an hour ago.
- A signature is made with `TOPIC_WATCH_SECRET`, which both Workers hold as a Worker secret. While the secret is absent the signature is empty and a watch is taken unverified, as it is today; once it is present both Workers enforce.

The design, its rejected alternatives and the rollout are in [design.md](design.md).

## Out of scope

- Revoking a subscription a tab already holds when its person leaves a room. A watch is held until its tab unwatches or closes, and the bound limits only how long a stored signature can re-open one.
- The per-kind topic `room/*:<table>:*`. It stays a signed-read topic like any other, and no read names it except one the budget collapses.
