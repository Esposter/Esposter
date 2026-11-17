# Proposal: the webpage backfill's read check, and the tick it left

The archived change `2026-11-18-resource-webpage-stored-backfill` ticks its task 3.1 as done, but its own Result says the read check never ran: dev and prod each hold zero webpage resources and zero webpage publications, so there was no stored page to read. The email sibling, `2026-11-18-resource-email-root-props-backfill`, ticks every task, its unrun dev parse check (1.3) included, and records the wait in `.openspec.yaml` as `x-waiting`.

This change carries the unrun check forward so it is not lost in an archive. The archive is history and is not rewritten, so the recorded state lives here.

Out of scope: any edit to the archived change's files.
