# Pulumi Migration Follow-up Prompts

## Phase 2 Infrastructure Cleanup

- Convert imported flat Pulumi resources into typed component resources by domain: core resource groups, app hosting, storage, observability, messaging, automation, and cost controls.
- Replace spreadsheet-derived names with shared naming helpers generated from `Azure Assets - Reference.csv` and `Azure Assets - Regions.csv`.
- Add CI for `pulumi preview` using Azure OIDC credentials instead of local Azure CLI auth.
- Add policy checks for required tags, approved regions, deletion protection, and production SKU guardrails.
- Decide how to manage secrets: Pulumi ESC, Azure Key Vault references, or stack secrets.
- Normalize alerting: budgets, action groups, metric alerts, scheduled query rules, and Logic App notifications should have explicit owners and escalation paths.
- Audit Logic Apps and API connections after import. Preserve phase-1 definitions first, then refactor repeated workflows into components only after previews are clean.
- Review whether Event Grid subscriptions should stay as direct Azure resources or become app-owned module outputs tied to the Function App/WebPubSub deployment lifecycle.
- Add a runbook for drift handling: `pulumi refresh`, review state changes, and only then `pulumi up`.
- Update README files after migration: root README, `packages/app/README.md`, `packages/azure-functions/README.md`, and `packages/infra/README.md` should agree on deployment ownership and Azure dependencies.
- Archive the spreadsheet as source evidence once the Pulumi state and generated code cover every live resource.
