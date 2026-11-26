# Tasks

## 1. Helpers

- [ ] 1.1 Write the counter step helper and the assigned value helper in the shared server package, and route the invite join's step through the counter helper. Write the router test first, holding "A join adds one to the uses of its invite" and "A refused join adds nothing to the uses of its invite", and see the refused case fail before the helper is routed. Verified by `pnpm test server/trpc/routers/invite.test.ts --run` from `apps/web` passing.
- [ ] 1.2 Route every other counter step and assigned value in the server and jobs code through the two helpers, so that no statement adds to a counter column outside them. Verified by a search of the server and jobs code for the step's arithmetic returning no hit outside the helpers and the migrations, with the search output recorded in the change.

## 2. Mentions

- [ ] 2.1 Enqueue a reconcile for a room when its mention count update fails after the message is written, and have the reconcile recount the mention counts and the last message time from the messages. Write the tests first, holding "A failed mention write enqueues a reconcile for its room", "A reconcile recounts the mention count and the last message time from the messages of the room" and "A burst of failed mention writes queues one reconcile for the room", and see them fail before the reconcile exists. Verified by the reconcile handler's test passing under `pnpm -C apps/jobs exec vitest run`.
- [ ] 2.2 Clear the reader's mention count to zero when the room is read. The reset is an assigned entry its write states, so the predictor shows zero at once and a refusal restores the held count; it is not a patch, so the overlay's refusal does not apply. Write the store tests first, holding "Opening a room shows its mention count at zero at once" and "A refused clear restores the held mention count", and see them fail first. Verified by `pnpm test app/store/message --run` from `apps/web` passing.

## 3. Answer-only values

- [ ] 3.1 Keep the storage counter and the view count answer-only. Each holds its value until its write answers, and shows the value its answer carries once it arrives. Write the tests first, holding "The storage counter holds its value until the reserve answers", "A view count holds its value until the view is counted" and "A counter shows the value its answer carries", and see the last fail before the answer is applied to the counter. Verified by the storage test passing under `pnpm test app/store/storage.test.ts --run` and the view count test, which this change writes, passing from `apps/web`.
