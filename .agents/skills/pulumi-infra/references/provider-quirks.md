# GitHub and provider-package quirks

Read when touching the GitHub `Repository` resource and its branch protection, when a GitHub setting has no field in the provider, or when a review asks for named imports from a provider package.

## GitHub branch auto-delete

GitHub's repository `deleteBranchOnMerge` is a system action that **bypasses ruleset deletion rules**, so it deletes a long-lived branch on merge even when the ruleset protects that ref from deletion. Keep `deleteBranchOnMerge: false` on the `Repository` resource and clean merged head branches up via the `Delete Merged Branch` GH Actions workflow (`.github/workflows/DeleteMergedBranch.yaml`), which excludes `main` and `ai/queue` explicitly. Don't rely on rulesets to protect long-lived branches from native auto-delete.

## GitHub ruleset bypass is per ruleset

A bypass actor is exempt from every rule in its ruleset and from nothing outside it — one ref, two kinds of exemption, two rulesets, each with its own bypass list; which ruleset holds which ref, and why, is `openspec/specs/infra/branch-namespaces/design.md`. A ruleset also cannot name an individual user: the session and the review workflow are the Admin repository role, and Renovate is the app's global id.

## GitHub settings the provider has no field for

GitHub ships settings the provider has not caught up with: the `pull_request` rule's `require_extra_approval_for_unattributed_changes` (on by GitHub's default) and private vulnerability reporting (a `PUT .../private-vulnerability-reporting`) are both outside `@pulumi/github` at the version the lockfile resolves. A field the provider does not know is one `pulumi up` neither writes nor reverts, so such a setting is set on the repository directly and recorded in the page that owns it — and no preview can prove it stayed, because a preview diffs the program against state and a field outside the schema is in neither (`references/operations.md`). Reading the live object is what settles it, before trusting the source for what a rule enforces and again after each apply: `gh api repos/Esposter/Esposter/rulesets/<id>` for the rule parameter, `gh api repos/Esposter/Esposter/private-vulnerability-reporting` for the repository setting. What the unattributed-changes parameter does is `openspec/specs/infra/branch-namespaces/design.md`.

A field the provider _does_ carry can still be refused: enabling a GitHub Secret Protection surface on an unlicensed repository returns 200 with the status left `disabled`, and declaring one is then a diff that never closes. Read the setting back after the apply — an apply reporting `1 updated` is not the setting being on.

## Why a provider package is imported as a namespace

The rule — `import * as cloudflare from "@pulumi/cloudflare"`, the one exception to named imports from libraries — is in `SKILL.md`; this is what breaks when it is "fixed".

- Provider packages are CommonJS and lazy-load every resource submodule through utilities.lazyLoad, which installs getters on the `exports` object via `Object.defineProperty`. That mechanism only works through the live namespace object from `import * as`. `@pulumi/cloudflare`'s `index.js` does this for every resource.
- `apps/infra` is `"type": "module"`, so named ESM imports from those CJS modules force Node's interop to evaluate bindings eagerly — `require()`-ing every referenced submodule at import time and defeating the lazy-load (slower startup, higher memory). They are not tree-shakable.
- Pulumi's own codegen always emits `import * as`. Match it; do not "fix" provider imports for lint/style consistency.
