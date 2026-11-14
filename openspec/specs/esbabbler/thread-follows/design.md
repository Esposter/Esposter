# Thread Follows

Follow a thread and receive a push notification whenever someone replies to it, and open a **Followed Threads** drawer to jump back into any thread you follow. This is Discord's thread-following model over the single-level [thread](../threads/design.md) the pane shows.

## How it works

Replying to a message is an implicit follow (Discord behaviour) for the replier **and for the root message's author**, and the thread menu's notification toggle is the explicit follow. All three write a row to `threadFollowsInMessage`. Following the replier alone would leave the one member the thread belongs to as the only one the pipeline never reaches, while anyone who merely replied once keeps being told. When a reply lands, the room's followers of that thread — everyone except the replier and anyone whose room notification preference is `Never` — receive a push notification through the web-push pipeline.

```mermaid
flowchart TD
  R["createMessage with replyToId"] --> P["persist the reply — the room object"]
  P --> AF["auto-follow the replier — clears a recorded unfollow"]
  P --> AR["auto-follow the root's author — insert only, never clears theirs"]
  P --> Q["publishNotification — the reply names its thread root"]
  Q --> E["ProcessNotification unions followers into the room's recipients"]
  E --> F["web-push to the union"]
  F --> D["notification deep-links to the thread root"]
  B["thread menu notification toggle"] --> FT["followThread / unfollowThread"]
```

### An unfollow outranks somebody else's reply

The root author's auto-follow is the one follow a member does not perform themselves, so it is the one that could undo a decision they did make. `unfollowThread` therefore **records** the unfollow — it sets `isUnfollowed` on the row rather than deleting it — because a deleted row reads exactly like a member who was never followed, and auto-follow would re-subscribe them on the next third-party reply with no way to make the unfollow stick.

Which follows may clear that tombstone is decided by whose action the follow is, the `isSelfInitiated` argument to `createThreadFollow`:

| Follow                           | Self-initiated | Effect on a recorded unfollow |
| :------------------------------- | :------------- | :---------------------------- |
| the thread menu's toggle         | yes            | cleared — the member asked    |
| the replier's own reply          | yes            | cleared — Discord parity      |
| the root author, someone replies | no             | left alone                    |

Both reads — `readFollowedThreadRootIds` (follow state) and `getThreadFollowerUserIds` (the notification recipients) — skip unfollowed rows, so a tombstone is neither a follow nor a notification.

A root message with no author at all (a webhook message carries none) contributes no root-author follow: `userId` is `NOT NULL`, so the reply would otherwise fail its insert on every reply to a webhook message.

Auto-follow and the notification both sit in the reply's best-effort tail ([persist then notify](../../architecture/persist-then-notify/design.md)), so a lost follow costs one subscription and a lost publish costs one notification — and the follows are written first, because they are what ProcessNotification reads. Both follows are one shared step (`createReplyThreadFollows`) rather than something each sender re-implements: a reply sent from the app and a scheduled message delivered into a thread by its room object's alarm are the same reply, and a path that had to remember this is a path that eventually forgets it. A reply raises **one** notification, not a second one aimed at followers: the followers widen the message's recipient set inside ProcessNotification, which is where the live follower list is ([notifications](../../architecture/notifications/design.md)).

## Data model

D1 table `threadFollowsInMessage`: `userId`, `roomId`, and `threadRootId` (the root message's integer id in its room), with a composite primary key over all three so a follow is idempotent, plus `isUnfollowed` — the member's recorded decision to stop, which is why a row outlives an unfollow. Room deletion cascades the follows away. The drawer resolves the followed roots back to their messages in one batched read of the room's object (`readMessagesByIds`), which drops any root that was deleted, so it never lists a dangling follow. The drawer lists the roots newest-first by id (a message id only grows within its room) rather than in the order the follows were recorded, and it returns whichever entity each root actually is — a webhook message can be a thread root like any other.

## Procedures

All under `message.` in `server/trpc/routers/message/index.ts`, member-gated:

| Procedure                                  | Purpose                                                                                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `followThread({ roomId, threadRootId })`   | explicit follow (idempotent)                                                                                                                                     |
| `unfollowThread({ roomId, threadRootId })` | record the unfollow (idempotent; written even where no follow row exists)                                                                                        |
| `readFollowedThreads({ roomId })`          | `{ threadRootIds, threads }` — every followed root id (including deleted roots, the follow-state source of truth) beside the newest-first roots the drawer lists |

## Key files

| File                                                                  | Role                                 |
| :-------------------------------------------------------------------- | :----------------------------------- |
| `packages/db-schema/src/schema/message/threadFollowsInMessage.ts`     | follow table                         |
| `packages/db/src/services/notification/getThreadFollowerUserIds.ts`   | follower recipient query             |
| `packages/db/src/services/message/thread/createThreadFollow.ts`       | idempotent follow insert             |
| `packages/db/src/services/message/thread/createReplyThreadFollows.ts` | the follows a reply owes             |
| `apps/web/server/services/message/thread/upsertThreadUnfollow.ts`     | records the unfollow on the row      |
| `apps/functions/src/services/notification/resolveNotification.ts`     | unions followers into the recipients |
| `apps/web/app/store/message/threadFollow.ts`                          | client follow state + drawer list    |
| `apps/web/app/components/Message/RightSideBar/Threads/`               | Followed Threads drawer              |
| `apps/web/app/composables/message/thread/useThreadActionItems.ts`     | thread menu's notification toggle    |
