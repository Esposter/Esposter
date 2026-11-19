# Inferred live topics

## Why

Every tRPC query and mutation in the web app names its live topics by hand, through `getTopicsProcedure`. A read watches the topics it names and a write publishes the topics it changes, so a declaration that leaves out a table the query joins leaves the read stale until someone notices. The bookmark dock is the clearest case: it joins resources and room memberships and declares only its own bookmarks topic, so neither a resource's change nor a membership change reaches it. Each such gap has been fixed by one more declaration and one more test that a write publishes a named topic. The owner wants the class of gap and its per-procedure tests gone, with the declaration reduced from one per procedure to one per table.

## What changes

Live topics are inferred from the queries themselves. The design is in [design.md](design.md); in short:

- Each table declares its scope columns once, in its Drizzle definition.
- A query's read set is walked from the Drizzle builder it runs, and a mutation's write set is captured from the scope values its statements return.
- `getTopicsProcedure` and its `getTopics` callbacks are deleted, and so are the hand-written topic assertions they were tested by. The mechanism's own tests replace them.

The change is internal. No procedure's input or output changes, and no user sees a different page: a read stays live as it is today, and the gaps listed in the design are closed by the inference.

## Out of scope

- A row-delta subscription service that pushes changed rows instead of refetching. The design records why it is not built now and what would bring it back.
- The client's query cache and its primitives (`executeQuery`, `readItems`), which keep their contract; only the topics they receive change source.
- Pagination, the sort model and the room and call objects' own SQLite schemas, beyond the write capture the design names for them.

## Open questions

- The per-table fan-out of a table-wide topic is measured in the migration before the table policy is accepted for each table (task 6.1). The row policy for joins is decided from the same measurement.
