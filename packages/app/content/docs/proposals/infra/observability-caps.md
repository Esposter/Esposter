---
title: Observability caps
description: Proposal — measure telemetry ingestion, then cap Log Analytics daily quota and enable App Insights sampling.
---

# Observability Caps

Log Analytics currently ingests uncapped (`dailyQuotaGb: -1`) and App Insights runs unsampled — the one place the $0.01 budget guard can be outrun by a telemetry burst before the Logic App reacts.

## Scope

**Today:** 30-day Log Analytics / 90-day App Insights retention are set; ingestion volume is unmeasured; the budget guard is the only backstop.

**This adds:**

1. **Measure** — a week of `Usage | summarize IngestedGB` per table/source to know the real baseline (expected: well under 1 GB/day).
2. **Cap** — set `workspaceCapping.dailyQuotaGb` to a small multiple of baseline (e.g. 0.5) in the Pulumi workspace resource; alert rule on `_LogOperation` cap-reached events.
3. **Sample** — enable adaptive sampling in the Function Apps' App Insights connection (host.json `samplingSettings`), excluding exceptions.

## Key files

| File                                                  | Change                 |
| :---------------------------------------------------- | :--------------------- |
| `packages/infra/src/azure/` (Log Analytics workspace) | `dailyQuotaGb` + alert |
| `packages/azure-functions/host.json`                  | sampling settings      |

## Notes

Cap-reached drops telemetry silently for the rest of the day — acceptable by design (this estate prefers losing logs to paying for them); the alert makes it visible.
