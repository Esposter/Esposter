# Infrastructure Roadmap

Ordered roadmap for `packages/infra`.

## Phase 2: Optimize Infrastructure

Goals:

- reduce unnecessary Azure spend;
- remove duplicated or obsolete resources;
- review budgets, alerts, action groups, Logic Apps, and Event Grid subscriptions;
- reduce always-on compute where possible;
- align diagnostics, logging retention, and alert thresholds with actual operational needs;
- verify least-privilege access for identities, connections, keys, and callback URLs;
- convert imported literal settings into maintainable constants or components where that reduces risk.

Operational rule:

- run `pnpm infra:preview` before every apply;
- never use `pulumi up --skip-preview`;
- after any partial or failed update, rerun preview before the next apply.

Candidate review areas:

- Function App hosting plan, scaling, and idle behavior;
- Application Insights sampling and retention;
- Log Analytics retention;
- Cognitive Search SKU and replica/partition count;
- Web PubSub SKU and unit count;
- Event Grid subscription filters and retry behavior;
- Logic App triggers, callback URLs, and API connections;
- budgets and notification thresholds;
- storage account redundancy, public access, TLS, lifecycle rules, and soft-delete settings.

## Phase 3: Naming And Structure Refactor

Goals:

- current shorthand tokens stay; renames require Azure replace operations and are not worth the risk;
- introduce Pulumi components for repeated patterns;
- split resource arguments into well-named constants only where it improves reviewability;
- document intentional exceptions where Azure naming rules force compact names.

Renaming Azure resources can be destructive or require replacement. Treat naming changes as separate planned migrations, not casual refactors.
