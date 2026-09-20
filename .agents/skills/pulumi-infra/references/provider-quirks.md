# Azure Native and GitHub provider quirks

Read when picking an Azure Native resource token, naming a Logic App API connection, touching the GitHub `Repository` resource and its branch protection, or when a review asks for named imports from a provider package.

## Azure Native resource tokens

Use tokens matching the installed provider version. For Azure Native v3:

- Action Groups: `azure-native:monitor:ActionGroup`
- Budgets: `azure-native:consumption:Budget`
- Event Grid subscriptions: `azure-native:eventgrid:EventSubscription`

Logic App API connections may have live names like `azureappservice-1`, `azureappservice-2`, `arm`, `arm-1` — don't assume the spreadsheet naming-convention names are the live Azure resource names.

An `ApiReferenceArgs` block is the connector's own published metadata, so it is identical in both stacks — only the connection's own name and resource group differ. Declare it once as a shared constant rather than per stack.

Azure rotates that metadata on its own — `iconUri` moves to a new CDN host and connector version — so a stack the estate has not applied in a while previews the connections as `~properties` with only `api.iconUri` differing. The pinned constant is the stale side of that diff, and applying it pushes the older URL back over the live one. Converge by re-pinning the constant to the value the preview reports as current, never by applying the plan as it stands.

## GitHub branch auto-delete

GitHub's repository `deleteBranchOnMerge` is a system action that **bypasses ruleset deletion rules**, so it deletes a long-lived branch on merge even when the ruleset protects that ref from deletion. Keep `deleteBranchOnMerge: false` on the `Repository` resource and clean merged head branches up via the `Delete Merged Branch` GH Actions workflow (`.github/workflows/DeleteMergedBranch.yaml`), which excludes `main`/`develop` explicitly. Don't rely on rulesets to protect long-lived branches from native auto-delete.

## GitHub ruleset bypass is per ruleset

A bypass actor is exempt from every rule in its ruleset and from nothing outside it — one ref, two kinds of exemption, two rulesets, each with its own bypass list; which ruleset holds which ref, and why, is `apps/web/content/docs/infra/branch-namespaces.md`. A ruleset also cannot name an individual user: the session and the collector are the Admin repository role, and Renovate is the app's global id.

## GitHub settings the provider has no field for

GitHub ships settings the provider has not caught up with: the `pull_request` rule's `require_extra_approval_for_unattributed_changes` (on by GitHub's default) and private vulnerability reporting (a `PUT .../private-vulnerability-reporting`) are both outside `@pulumi/github` at the version the lockfile resolves. A field the provider does not know is one `pulumi up` neither writes nor reverts, so such a setting is set on the repository directly and recorded in the page that owns it — and no preview can prove it stayed, because a preview diffs the program against state and a field outside the schema is in neither (`references/operations.md`). Reading the live object is what settles it, before trusting the source for what a rule enforces and again after each apply: `gh api repos/Esposter/Esposter/rulesets/<id>` for the rule parameter, `gh api repos/Esposter/Esposter/private-vulnerability-reporting` for the repository setting. What the unattributed-changes parameter does is `apps/web/content/docs/infra/branch-namespaces.md`.

A field the provider _does_ carry can still be refused: enabling a GitHub Secret Protection surface on an unlicensed repository returns 200 with the status left `disabled`, and declaring one is then a diff that never closes. Read the setting back after the apply — an apply reporting `1 updated` is not the setting being on.

## Why a provider package is imported as a namespace

The rule — `import * as azure_native from "@pulumi/azure-native"`, the one exception to named imports from libraries — is in `SKILL.md`; this is what breaks when it is "fixed".

- Provider packages are CommonJS and lazy-load every resource submodule through `utilities.lazyLoad`, which installs getters on the `exports` object via `Object.defineProperty`. That mechanism only works through the live namespace object from `import * as`.
- `apps/infra` is `"type": "module"`, so named ESM imports from those CJS modules force Node's interop to evaluate bindings eagerly — `require()`-ing every referenced submodule at import time and defeating the lazy-load (slower startup, higher memory). They are not tree-shakable.
- Pulumi's own codegen always emits `import * as`. Match it; do not "fix" provider imports for lint/style consistency.
