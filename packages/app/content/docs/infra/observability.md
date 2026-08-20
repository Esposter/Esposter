---
title: Observability
description: Application Insights and Log Analytics are deliberately not provisioned — telemetry is not worth the spend, so the budget guard is the cost ceiling and Azure platform metrics answer operator questions.
---

# Observability

This estate runs with **no Application Insights and no Log Analytics**. Neither is provisioned in either environment, and the Function Apps carry no `APPINSIGHTS_*` / `APPLICATIONINSIGHTS_*` app settings. This is a deliberate cost decision, not an omission: paid telemetry ingestion (and the alert rules layered on it) recurred at a daily cost that bought nothing this estate acts on. Removing it is the single largest line-item saving in the infrastructure.

## What we rely on instead

- **The `$0.01` budget guard is the cost ceiling.** Each Function App has a Consumption (Y1) plan — no idle cost — and a budget that stop-triggers it via Logic App automation the moment spend registers. That guard, not telemetry, is what bounds cost. See [optimization review](/docs/infra/cost-and-security-posture).
- **Azure portal platform metrics** answer the operator-level questions (invocation counts, storage size, Service Bus depth) for free, without a Log Analytics workspace to ingest into.
- **Function handler logs** still write to `context.log` / `context.error`; they surface in the Functions host's live log stream and the platform's built-in log, just not into a queryable, retained, billed store. That surface is what `host.json` leaves `logging.fileLoggingMode` unset for — the default `debugOnly` turns filesystem logging on for as long as a log stream is attached, and it is the only sink those calls have now. Setting it to `never` costs nothing and silently discards every `context.error` in the app, so the operator instructions above and in [Event Grid dead-letter](/docs/infra/eventgrid-dead-letter) stop working.

## Do not "add monitoring back" as a best practice

Provisioning Application Insights, a Log Analytics workspace, diagnostic settings, smart-detector rules, or scheduled-query alerts is a recurring cost with no consumer here, and a review suggestion to add any of them "for observability best practice" should be **closed, not applied**. The trade — losing queryable telemetry and automated alerting to stay in the free tier — is intentional and recorded here so it does not get re-litigated per PR. Revisit only if paid tiers/quotas, an on-call rotation, or a real incident-investigation need make retained telemetry worth the spend.

One consequence to know: nothing pages on the [Event Grid dead-letter](/docs/infra/eventgrid-dead-letter) quarantine and replay-discard cases. An alert on either would be a scheduled query over the App Insights `traces` table, which is exactly what this estate does not provision — so both land silently and are found by inspecting the `deadletter` container.

## Key files

| File                                                                | Role                                                 |
| :------------------------------------------------------------------ | :--------------------------------------------------- |
| `packages/infra/src/azure/resources/Microsoft.Consumption/budgets/` | The `$0.01` guard budgets — the actual cost ceiling  |
| `packages/infra/src/azure/resources/Microsoft.Web/sites/`           | Function Apps, carrying no App Insights app settings |
