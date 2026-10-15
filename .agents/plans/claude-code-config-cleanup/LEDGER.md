# Ledger — ClaudeCodeConfig cleanup

Status values: `proposed` · `ready` (dependencies done) · `in progress` · `merged` · `blocked`.
Every row is `proposed` until its change is implemented. Owners are not assigned; a row with no owner is open to whoever picks it up.

## Changes

| #   | Change                        | Capabilities                              | Depends on                                    | Gate                                                                                             | Owner     | Status   |
| --- | ----------------------------- | ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- | -------- |
| 1   | `archive-shipped-changes`     | `spec-truth`                              | —                                             | Verify-Config GREEN; `openspec/specs/` holds every shipped capability                            | to assign | proposed |
| 2   | `split-verify-config`         | `verification-gate`                       | 1 (both edit Verify-Config sections 5d–5h)    | Verify-Config report and exit codes identical to the unsplit run                                 | to assign | proposed |
| 3   | `single-source-openspec-kit`  | `openspec-kit`                            | —                                             | derived copies byte-identical to their source; `/opsx-setup` writes the schema from the template | to assign | proposed |
| 4   | `readme-pointer`              | `contract-docs`                           | —                                             | README word count under 1,000; no restated skill table or hook list                              | to assign | proposed |
| 5   | `prune-overlapping-skills`    | `skill-catalogue`                         | 2 (Verify-Config)                             | each agent names its skill; no alias skill; `grill-me` removed; `eval-harness` decided           | to assign | proposed |
| 6   | `retire-legacy-install-paths` | `marketplace-aliases`, `deploy-migration` | — (date: 2026-12-15, proposed, not confirmed) | aliases removed on the confirmed date; pre-v3 migration replaced by a report                     | to assign | proposed |

Suggested order: 1 → 2 → 3 → 4 → 5 → 6. Change 1 comes first because change 2 re-points the same Verify-Config sections that 1 re-points; doing 2 first would move the checks 1 needs to read. Change 6 waits for its date regardless of order.

Open decisions, each recorded in its change's `design.md`:

- Change 1: one pull request for six archives, or six (the team rule is one change per pull request). Recommended: one.
- Change 6: removal date 2026-12-15. Needs confirming before the announcement.
- Change 5: `eval-harness` is removed only if no caller exists; decided in its task 1.1.

## Pushdown items

From `pushdown/README.md` in `ClaudeCodeConfig`. Each row leaves the configuration when its target repository has received it and the item is deleted from `pushdown/` there. Owners are not known; they are for the team to assign.

| #   | Item                                | Type    | Target repo                                          | Target path                                              | Coupled with                                | Owner     | Status |
| --- | ----------------------------------- | ------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------- | --------- | ------ |
| P1  | `techdocs/techdocs-publish.md`      | rule    | TechDocs (KnowledgeBase project)                     | `.claude/rules/techdocs-publish.md` or the repo contract | P2 (ship as a pair)                         | to assign | open   |
| P2  | `techdocs/techdocs-reviewer.md`     | agent   | TechDocs                                             | `.claude/agents/techdocs-reviewer.md`                    | P1                                          | to assign | open   |
| P3  | `config-pbi/config-specialist.md`   | agent   | Config/TOME tooling repo                             | `.claude/agents/config-specialist.md`                    | P4, P5–P7 (needs the three platform skills) | to assign | open   |
| P4  | `config-pbi/config-pbi.md`          | command | Config/TOME tooling repo                             | `.claude/commands/config-pbi.md`                         | P3 (ship as a pair)                         | to assign | open   |
| P5  | `platform/platform-architecture/`   | skill   | Platform repo (Pantheon or ops repo — owner decides) | `.claude/skills/platform-architecture/`                  | P3                                          | to assign | open   |
| P6  | `platform/config-schema-reference/` | skill   | same as P5                                           | `.claude/skills/config-schema-reference/`                | P3                                          | to assign | open   |
| P7  | `platform/deployment-workflow/`     | skill   | same as P5                                           | `.claude/skills/deployment-workflow/`                    | P3                                          | to assign | open   |
| P8  | `platform/azure-devops/`            | skill   | same as P5, or the ADO tooling repo                  | `.claude/skills/azure-devops/`                           | P3                                          | to assign | open   |

Move P1–P2 and P3–P8 together; the coupling column is the reason.

## Prerequisites

| Item                                                                                             | Status                                                                               |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| OpenSpec CLI as an Esposter project dependency (`pnpm exec openspec`, resolves 1.12.0)           | done; global install removed                                                         |
| Drafted docs patch for `ClaudeCodeConfig` (`drafts/docs-openspec-source-of-truth.patch`)         | drafted, not applied; needs approval (changes what other machines load)              |
| OpenSpec CLI on each other machine that implements a row (`pnpm i` in Esposter)                  | open                                                                                 |
| `/opsx-setup` on each machine that implements a row                                              | open                                                                                 |
| Each change validates with `openspec validate <id> --strict --no-interactive` in its target repo | to do at implementation, per row (validated here from the planning checkout; passes) |
