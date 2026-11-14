# Published View Analytics

A published link is otherwise a one-way door: an owner exports fifty invites and the only signal back is whichever respondents finish. An exact view counter on `readPublishedResourceContent`, surfaced on the Overview blade, makes the middle of the funnel visible for **every** publishable type — how many opened the dashboard, the webpage, the survey. For surveys, views against responses is the completion rate.

This is explicitly **not** an analytics product: no unique-visitor identification (no cookies, no IP storage), no referrer capture, no time-series UI. A total plus a per-day bucket, so a future chart is possible without rework. Deliberately approximate.

## How it works

```mermaid
flowchart LR
  VIEWER["public /view/[type]/[id]"] -->|readPublishedResourceContent| SERVE["serve the publish snapshot"]
  SERVE -->|"fire-and-forget increment<br/>(failure never blocks the read)"| RV[("resourceViews table<br/>one row per UTC day<br/>count")]
  OV["Overview Essentials<br/>(publishable + published)"] -->|readResourceViewCount owner| SUM["total views"]
```

- **Storage** — `resourceViews`, a SQLite table in core: one row per resource per UTC day, unique on the resource and the date, with a single `count` column. Daily buckets keep rows small and make "views this week" a date-range read over the resource's rows when it is needed.
- **Increment** — one statement per view: an insert of the day's row that, on conflict, adds one to its `count` (`INSERT ... ON CONFLICT DO UPDATE`), so two concurrent views both count and nothing retries. A failed statement is logged and that view is dropped: the read path must never fail or slow because of telemetry. Counting happens only after the read is guaranteed to succeed, so a 404 never lands in the buckets. Rate limiting on the public read already bounds write volume.
- **Read** — `readResourceViewCount({ id })`, owner-gated, sums the resource's day rows in one statement. Magnitudes matter more than precision.
- **Surface** — Overview Essentials gains a **Views** row for published resources. On a survey the Views row sits in Essentials beside the response count ([response management](../survey-response-management/design.md)) — the funnel in two numbers.
- **Delete and unpublish** — the rows are cleared by the cascade from the resource row, which `purgeResource` deletes, not by delete: a soft-deleted resource keeps its counts for the whole [recycle bin](../recycle-bin/design.md) window, so a restore restores the history too. Unpublishing leaves history intact as well, so re-publishing continues the same counter. The count is the resource's audience, not the version's.

## Procedures

| Procedure               | Auth  | Input    | Purpose           |
| ----------------------- | ----- | -------- | ----------------- |
| `readResourceViewCount` | owner | `{ id }` | summed view count |

The increment is internal to the public read, not a procedure.

## Key files

| File                                                                  | Role                                               |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| `packages/db-schema/src/schema/resource/resourceViewsInResource.ts`   | the day-row table and its select schema            |
| `apps/web/server/services/resource/incrementResourceViewCount.ts`     | the fire-and-forget increment                      |
| `apps/web/server/services/resource/readResourceViewCount.ts`          | the summed read                                    |
| `apps/web/server/trpc/procedure/resource/createResourceProcedures.ts` | increment on the public read + the count procedure |
| `apps/web/app/components/Resource/Overview.vue`                       | the Views row                                      |

## Notes

- Riding `createResourceProcedures` makes this automatic for every current and future publishable type — no per-type wiring, consistent with the capability model. It is gated by the same `publishable` seam as the publish procedures: a type with no public URL has no views to count.
- It counts views of the _content read_, so SSR/proxy prefetches and one person refreshing five times all count. The UI says "views", never "visitors".
- This is platform-side counting, not client analytics — no script on the view page, nothing for ad-blockers to eat, and it works for OG-unfurl bots too (which is fine at this fidelity).
- Per-version stats are out of scope; they would belong to [resource snapshots](../resource-snapshots/design.md) if ever needed.
