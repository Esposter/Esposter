# Infrastructure Roadmap

This roadmap replaces the temporary spreadsheet-driven migration notes as the durable plan for `packages/infra`.

## Phase 1: Adopt Existing Azure Resources

Status: mostly complete.

Goals:

- import existing manually-created Azure resources into Pulumi state;
- keep resource declarations one-per-file;
- preserve current Azure names exactly;
- keep `protect: true` on imported resources;
- produce clean `pnpm infra:preview` output before behavior changes.

Cleanup after phase 1:

- move the phase-1 migration record to the root completed features folder;
- delete `packages/infra/data/`;
- delete `packages/infra/generated/`;
- delete `packages/infra/src/scripts/buildAzureImportManifest.ts`;
- remove `inventory:build` and import-manifest-only scripts from `packages/infra/package.json`;
- keep `src/resources/`, `src/index.ts`, `dist/`, and the docs in this folder.

## Phase 2: Optimize Infrastructure

Goals:

- reduce unnecessary Azure spend;
- remove duplicated or obsolete resources;
- review budgets, alerts, action groups, Logic Apps, and Event Grid subscriptions;
- reduce always-on compute where possible;
- align diagnostics, logging retention, and alert thresholds with actual operational needs;
- verify least-privilege access for identities, connections, keys, and callback URLs;
- convert imported literal settings into maintainable constants or components where that reduces risk.

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

- decide whether current shorthand tokens should stay;
- replace inefficient or unclear abbreviations only when the Azure rename cost is worth it;
- introduce Pulumi components for repeated patterns;
- split resource arguments into well-named constants only where it improves reviewability;
- document intentional exceptions where Azure naming rules force compact names.

Renaming Azure resources can be destructive or require replacement. Treat naming changes as separate planned migrations, not casual refactors.

## Phase 4: Production Stack Alignment

Goals:

- decide whether the project uses one stack or separate stacks;
- if using one stack, rename the current imported stack to `prod` or `main`;
- if using separate stacks, gate resources by environment and import each environment into the matching stack;
- run a clean preview before any update;
- document the final stack policy in `docs/stacks-and-environments.md`.
