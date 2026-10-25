# Roadmap

Open work only. Settled ideas are listed in [deferred](../../deferred/post/) and [rejected](../../rejected/post/); check both before adding one.

## Next

- [x] [Comment sort](../archive/2026-10-25-post-comment-sort/design.md) — Hot, Top, New and Old above a post's comments, over the feed's own sort map
- [ ] Place the post sort map where the server test can reach it — `apps/web/server/trpc/routers/post.test.ts` imports `PostSortType` from `@/models/post/PostSortType` and `PostSortTypeSortByMap` from `@/services/post/PostSortTypeSortByMap`, which are client modules, while the server reads neither outside that test. The choice is between moving both into `apps/web/shared/` (the layer the file-organization convention gives models and services shared by client and server, at the cost of a sweep over the fourteen client importers) and having the test state its sort items itself. The router's input takes sort items, not `PostSortType`, so the test's dependence is the only reason the map is on the server side at all. Its typecheck errors predate this change and go with it.
