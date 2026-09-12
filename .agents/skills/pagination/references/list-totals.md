# Totals and Aggregates Over a Paginated List

Read when a surface shows a number about the whole list — an unread badge, an item count, a filtered tally — or when a keyed read's query closure writes anything besides the page it returns. The rule itself is in `SKILL.md` (the total is the server's, and the closure writes store state only); this page is why, and where each one breaks.

## A total over a paginated list is the server's, never the loaded rows

Any number a surface shows _about the whole list_ — an unread badge, a "N items" summary, a filtered tally — is
computed by the endpoint and returned with the page, because the client holds one page and the answer is about
all of them. A `computed` counting `items` is right only for a list that is never paginated (a client-owned half
that exists solely in the tab), and it fails in the direction nobody notices: it reads low, and it reads correct
the whole time the list is short enough to fit one page. So it survives every manual check and breaks for the
users with the most rows.

Return it from the same endpoint as the page rather than adding a second one — one round trip, and a total the
client cannot forget to ask for. The two statements still run against separate snapshots, so a write landing
between them can move the total by a row; put both in one statement or one transaction where that matters:

```typescript
// endpoint: the page and the total it belongs to, resolved together
const [items, [total]] = await Promise.all([findManyPage(), countMatchingRows()]);
return { paginationData: getCursorPaginationData(items, limit, sortBy), total: total?.count ?? 0 };
```

The store then holds the server's number and **every optimistic write that changes it moves it under the same
rollback as the list** — a delete decrements it, a clear-all zeroes it, and each rollback restores the previous
value alongside the previous rows. A write that gates on the loaded rows (`items.every(...)`) is the same bug one
layer down: gate on the total, which is the only value that speaks for the pages nobody has read.

## A keyed read's query closure does not run on the hydrating client

`readItems(query, { key })` adopts the payload on the hydrating render and **never calls `query`** there, so
anything the closure writes besides its returned page is written on the server only. That is fine — and the
reason the aggregate above may live in the closure — **as long as the destination is Pinia store state**, which
rides the payload and is restored on hydration. A closure that writes a module-level ref, a component ref or
anything else outside a store loses that value at hydration and leaves the surface rendering a default nobody
can explain. Anything read on the client goes in the store; the closure returns the page and writes store state,
nothing else.
