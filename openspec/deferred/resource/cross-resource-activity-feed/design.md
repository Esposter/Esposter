# Cross-resource activity feed

One feed on Home aggregating events (published, imported, saved) across all of a user's resources, instead of per-resource only.

## Why deferred

The [activity log](../../../specs/resource/activity-log/design.md) keeps its trail in one D1 table indexed on the resource (`resourceId`, then `id`) — the right shape for the per-resource blade. Its index on the user does not give the newest-first order a feed reads in, so a feed across a user's resources would sort every entry that user has written at read time, or add an index on the user and the time, which costs a write on every activity row. Either is real cost for a feed whose content the owner generated themselves (you know what you did).

## Revisit when

Multi-resource workflows make "what changed lately across everything" a question users actually ask — or collaboration lands, at which point the feed shows _other people's_ actions and earns the index.

## Cheaper interim

Home's recents list approximates "what did I touch lately"; the per-resource blade answers the deep question.
