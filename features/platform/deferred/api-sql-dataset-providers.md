# Api / Sql Dataset Providers

External HTTP APIs and SQL databases as dataset providers (the commented-out `Api`/`Sql` slots in `DataSourceType`).

## Why deferred

Both need per-user secret storage (connection strings, API keys), server-side egress to arbitrary hosts (SSRF surface), and SQL injection-safety — heavy security work with no internal consumer yet. Internal providers (survey responses, table documents) exercise the same contract without any of that risk.

## Revisit when

The datasets layer is shipped and a user-facing need for external data materializes.

## Cheaper interim

Download external data and import it as CSV/JSON/XLSX through the table editor's existing file import, then serve it as a `TableDocument` dataset.
