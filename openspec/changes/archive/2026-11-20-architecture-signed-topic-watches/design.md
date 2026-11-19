# Signed topic watches

## Problem

`TopicObject.subscribe` checks no membership. Any signed-in person can send a `watch` frame naming any topic, so each topic's object subscribes them, and the invalidations reach them when a write lands in it. The check the server already makes is the query: a read returns only what the person may see, and names the topics it read from. The gap is that the watch does not carry that proof.

## Decision

The server signs the topics a read was given to the person who read them, and a watch is taken only when the signature covers it. Nothing is added for membership: there is no topic-to-member map to keep in step with the rooms, the members and the kinds, because the read that produced the topics already answered the question.

```mermaid
sequenceDiagram
  participant C as client
  participant W as web Worker
  participant U as UserObject of the person
  participant T as TopicObject
  C->>W: query, as the signed-in person
  W->>W: read; topics named; signature over the person, readAt and the topics
  W-->>C: response header: path, readAt, signature, topics
  C->>U: watch frame: readAt, signature, the same topics
  U->>U: verify the signature for this person, and that readAt is within the bound
  alt signature covers the frame and is young enough
    U->>T: subscribe the person to each topic
  else refused
    U-->>C: nothing, the frame is dropped
  end
```

## The signed unit

One query's read is one signed unit: its `readAt`, the topics it named with the columns each read, and the signature. The signature is HMAC-SHA256 over a JSON payload of the person's id, `readAt`, and each topic as `[topic]` when it names every column and `[topic, columns]` when it names a list, so a topic with no columns and one with an empty list are told apart. It is base64url, 43 characters. The payload is built by `getTopicWatchPayload` in `@esposter/db-schema`, the one place both Workers read the shape from.

A signature covers exactly one read, so a frame carries exactly one read's topics. A frame that names a topic its signed read did not name, or drops one it named, has a payload the signature does not match, and is refused.

## Header

The topics header of a query is `path readAt signature topic…`. A signature is empty when no secret is set, which keeps the header's shape the same either way. A signed-out read names no topics, since only a signed-in person has a user socket that can watch them.

A tab still running the client from before signatures reads the header as it always did. Its parser drops an entry it cannot read as a topic, so the signature entry is ignored and the topics are read as before.

## Expiry

A watch is honoured for an hour after its read began (`TOPIC_WATCH_MAX_AGE_MS`, the same hour the write url's presign uses). The bound limits what a stored signature can do: a tab that kept one from a read made while it was in a room can re-watch that room's topic on a reconnect only until the hour is out. Past it the watch is refused, and the query that made it is read again by the reconnect's refetch, which answers with a fresh signature if the person may still read it, and none if they may not.

## The client

The connection store sends a read's frame when the read adds something the socket has not yet been sent: a topic that is not watched on this socket, a column the watch does not yet name, or a read that began before the time the topic is watched from. A read that adds nothing sends nothing, so a refetch of a query whose topics are unchanged costs no frame. Each socket starts with nothing sent, so the first watch of a topic after a reconnect sends its fresh read. The re-watch on reconnect sends each stored read as it was signed, and a stored read the server refuses for age is replaced by the refetch the reconnect makes.

## The user object

`webSocketMessage` takes a `watch` frame only when `checkTopicWatchSigned` accepts it for the object's person. With no secret set, or an empty one, it accepts every watch, a signature or none. With the secret it refuses a signature that does not match the payload (an empty one included, which a tab from before signatures sends), a read older than the bound, and a frame whose signature was made for another person. A refused frame is dropped without a reply, as an invalid frame is today.

## Rejected

- **A membership check at subscribe.** It needs a membership rule per topic kind, kept in step with every table that gates a read, and a second answer to the question the read already answers.
- **A signature per topic.** The client could then merge reads as it does now, but a merged frame names a topic set no single read produced, so a frame could widen the columns of a read it never made. The signature covers one read.
- **No expiry.** A stored signature would then re-open a topic after its person left the room, for as long as the tab lived.
- **Fail closed with the secret absent.** Every watch would be refused until the owner sets the value, which breaks live updates on every tab.
- **Gating the landing on the secret.** The branch and its worktree must be removed once landed, and a commit held back until the owner sets the value would have to stay on the branch.

## Rollout

- The secret is `TOPIC_WATCH_SECRET`: an optional secret in the realtime and web environment schemas, listed under `realtime` and `web` in `.github/worker-secrets.json`, and documented in both `.env.example` files. Its value is read from Pulumi ESC under `pulumiConfig.esposter-infra:dev_TOPIC_WATCH_SECRET` and `prod_TOPIC_WATCH_SECRET`, as the other Worker secrets are (`openspec/specs/architecture/environment/design.md`).
- The condition is that verification fails closed only once the secret is present. With no secret, the realtime Worker takes every watch unverified, as it did before signatures, and the web Worker signs nothing, so no watch is refused before the owner sets the value. The landing is not gated on it. The absent-secret branch is a fail-open path, and it is deleted once the value is live in both environments rather than kept as a fallback.
- The Deploy job puts each Worker's secrets after that Worker deploys: the realtime Worker's right after the realtime deploy, the web Worker's after the web deploy. The put reads each value with `pulumi env get` (`.github/actions/put-worker-secrets/action.yaml`). What `pulumi env get` does for a missing key is not checked here. If it fails, the step stops and the jobs and web Workers do not deploy until the value is set. If it returns nothing, an empty value is uploaded, and the check reads it as absent. Neither refuses a watch.
- Two windows remain once the value is set. The realtime Worker verifies as soon as its secret is put, but the web Worker signs only once its own secret is put, after its deploy. If the realtime put succeeds and the web put fails, signed-in watches are refused until the web secret is put. A tab still running the client from before signatures sends watches with no signature: they are taken while no secret is set, and refused once the realtime Worker holds one, until the tab reloads.
- Open: put the web Worker's secret before the realtime Worker can enforce, so the first window closes, and delete the absent-secret branch once the value is live.

## Key files

| Path                                                                   | Role                                                                                         |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/services/realtime/getTopicWatchPayload.ts`     | The payload a signature is made over, shared by both Workers                                 |
| `packages/db-schema/src/services/realtime/constants.ts`                | `TOPIC_WATCH_MAX_AGE_MS`, the bound a watch's read is held to                                |
| `packages/db-schema/src/models/realtime/UserClientFrame.ts`            | The watch frame: one read's `readAt`, its `signature` (empty when absent) and its topics     |
| `apps/web/server/services/realtime/createTopicWatchSignature.ts`       | Signs one read for the person who made it, empty while the secret is absent                  |
| `apps/web/server/trpc/middleware/inferTopicsMiddleware.ts`             | Signs a signed-in query's topics into its header                                             |
| `apps/web/shared/services/realtime/formatTopicsHeaderValue.ts`         | Writes the signature into the header entry                                                   |
| `apps/web/shared/services/realtime/readTopicsHeader.ts`                | Reads the signature back with its read                                                       |
| `apps/web/shared/models/realtime/TopicRead.ts`                         | The read a client holds, with its signature                                                  |
| `apps/web/app/services/realtime/collectTopics.ts`                      | Keeps each query's reads whole, unmerged, so each is watched as it was signed                |
| `apps/web/app/store/realtime/connection.ts`                            | Sends each read's frame once per what it adds, and re-watches every stored read on reconnect |
| `apps/web/app/composables/shared/useWatchTopics.ts`                    | Registers every read, so each refetch's signature is held                                    |
| `apps/realtime/src/services/topic/checkTopicWatchSigned.ts`            | Verifies a watch for its person: the signature, the payload and the bound                    |
| `apps/realtime/src/durableObjects/UserObject.ts`                       | Refuses an unverified watch before it stores or subscribes                                   |
| `apps/realtime/src/models/environment/RealtimeEnvironmentVariables.ts` | Declares `TOPIC_WATCH_SECRET` as an optional secret                                          |
| `apps/web/shared/models/environment/WebEnvironmentVariables.ts`        | Declares `TOPIC_WATCH_SECRET` as an optional secret                                          |
| `.github/worker-secrets.json`                                          | Lists `TOPIC_WATCH_SECRET` for the realtime and web Workers                                  |
| `.github/actions/put-worker-secrets/action.yaml`                       | Puts each Worker's listed secrets from Pulumi ESC                                            |
