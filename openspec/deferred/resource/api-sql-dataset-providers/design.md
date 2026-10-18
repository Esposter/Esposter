# API / SQL dataset providers

External HTTP APIs and SQL databases as dataset providers, which would be new members of `DataSourceType` beside Csv, Json and Xlsx.

## Why deferred

Both need per-user secret storage (connection strings, API keys), server-side egress to arbitrary hosts (SSRF surface), and SQL injection-safety — heavy security work with no internal consumer yet. Internal providers (survey responses, Sheet resources) exercise the same contract without any of that risk.

## Revisit when

A user-facing need for external data materializes.

## Cheaper interim

Download external data and import it as CSV/JSON/XLSX through the Sheet resource's existing import, then serve it as a Sheet dataset.
