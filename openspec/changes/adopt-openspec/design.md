## Context

See `proposal.md` for the motivation. The rejected page this change overturns, `apps/web/content/docs/architecture/rejected/spec-frameworks.md`, is removed by this change; its argument is answered here.

The repository already runs `openspec` 1.12.0 as a project dependency (`pnpm exec openspec`). Its `openspec/` folder holds `config.yaml`, the change, and the `specs/` directory that archive fills.

## Decisions

### Default `spec-driven` schema, with Esposter's rules in `config.yaml`

The team kit ships a forked `team-bdd` schema. It is a copy of `spec-driven` with the scenario template reworded to GIVEN/WHEN/THEN and a few extra rules. Compared file by file, the only substantive additions are those rules, and OpenSpec's `config.yaml` accepts per-artifact `rules` on any schema. So the fork buys nothing the config cannot express, and it costs a copy that drifts from upstream on every CLI bump. Esposter takes the default schema and writes its own rules in `config.yaml`.

- Rejected: copying `team-bdd` into `openspec/schemas/`. Two sources of the same templates, one of them ours to keep current.
- Rejected: the team's `operations` block. It names `/build`, `/gate` and `/ship`, which this repository does not have. Its stage flow is `AGENTS.md`'s, and that is the one place it is written.

### The scenario check is a tested TypeScript service, not a CommonJS hook

The team kit's `lint-scenarios.js` is a CommonJS script run from a PostToolUse hook. Esposter's root `package.json` is `"type": "module"`, so the script cannot load here, and a hook runs only on the machine that installed it. Esposter already keeps its repository tooling in `scripts/` as ESM under `tsx`, with colocated Vitest tests that CI runs. The check goes there:

- `scripts/src/services/openspec/lintScenarios.ts` reads one spec and returns findings. Its rules are the grammar in `config.yaml`: one optional GIVEN, one WHEN, one THEN, AND after any, and no prose inside a scenario.
- `readSpecFindings.test.ts` runs that check over every tracked or new spec in the repository. A broken spec fails CI, and nothing has to be installed on a machine to make it enforce.
- Rejected: a Vitest test that calls the OpenSpec CLI. `openspec validate` checks structure and does not read scenario steps, so it cannot replace the grammar check.

### The spec tree is `openspec/` at the root, not inside `content/docs`

Rejected: laying OpenSpec's `changes/` and `specs/` folders over `apps/web/content/docs`, which the old decision rejected. That direction stays rejected. Specs are read by tests and agents, and the docs tree is read by people through the `/docs` site. Putting both in one tree would make `index.test.ts` govern spec files and the sidebar map list them.

### No generated OpenSpec skills or commands in the agent tree

`openspec init --tools none` was used. The team kit's `--tools claude` writes ten `openspec-*` skills and an `opsx` command set into `.claude/`, which is `.agents/` here. Those skills duplicate the team's `openspec` skill, and the `/opsx:*` commands come from the machine profile anyway. The repository carries the skill that says how Esposter uses OpenSpec, and it points to the team kit for the commands.

## Answering the rejected argument

The old page made four claims. Each is answered here.

**"Every part of that loop already exists here."** The table in the old page maps each OpenSpec feature to a repository equivalent. Three of the equivalents do not do the job:

- _The delta artifact._ A proposal under `proposals/` is whole-subsystem sized, so it restates the design. Nothing says what changes against the current behaviour except the proposal's own scope section, and that section is prose.
- _The durable current-state spec._ The as-built page is prose. Its only check is that links, diagrams and backticked paths resolve. A page can describe behaviour the code no longer has and still pass every check.
- _Archive on completion._ It is done by hand. The old page says proposals are rarely left open. That is true only because nothing forces them to stay open, and nothing checks the page against what shipped afterwards.

**"The validator row is the decisive one."** `index.test.ts` checks that the docs tree is well formed. It does not check that a described behaviour exists. OpenSpec's scenario-to-test rule is the check that is missing, so the two do not compete: `index.test.ts` keeps governing the docs site, and the scenario test governs the specs.

**"The point a framework cannot answer is that this tree is rendered and read by people."** That holds for product documentation, which stays in `content/docs`. Specs are not that. They are read by the test suite and by agents, and the owner has said the docs are not read by people. A spec's rendering is not a benefit it needs.

**"Task decomposition and deltas are already covered."** Plan mode covers the per-session checklist, and that is right for it. Deltas are the part the old page dismissed as relevant only when proposals are small. Esposter's proposals are whole-subsystem sized by convention, which is the case where a restated design drifts from the code without anyone seeing it. A delta makes the difference from the current spec visible when the change is written, and archive makes it true when it ships.

## Risks and trade-offs

- **Two descriptions of one behaviour.** The as-built page and the spec both describe shipped behaviour until an area migrates. [Risk] → the migration ledger moves one area at a time, and until an area moves, its as-built page stays the reference and new changes to it name the page they replace.
- **A well-formed spec can still be wrong.** The scenario check reads grammar, not truth. [Risk] → each scenario is meant to become a test, and the test is what proves it. A spec with no test behind it is the gap to catch in review.
- **A decision record has little behaviour to verify.** This change's requirements are about the process: folder shape, grammar and archive. The reasons live in this file, not in the spec. That is the outlier this change exists to test, and the verification is the tree test plus `openspec validate`.
- **The proposal report does not see OpenSpec changes.** [Risk] → the migration ledger adds sizing before any area moves.
- **Version pin.** `pnpm-workspace.yaml` pins `^1.12.0`, so `pnpm i` may resolve a later minor version. The team kit's `/opsx-setup` requires exactly `1.12.0`. [Risk] → the lockfile holds 1.12.0 until someone updates it, and the team kit's check is a finding for `ClaudeCodeConfig`, which needs approval to change.

## Migration plan

1. Delete the rejected page and its index row, in the same change as the new record, so the record and the removal land together.
2. Add `openspec/`, the scenario service and its tests.
3. Update `AGENTS.md` and the `docs` skill so new specifications go to `openspec/changes/`.
4. Migrating existing proposals and architecture pages is not part of this change; it is tracked as a ledger.

Rollback: restore the rejected page and its index row from git, and delete `openspec/` and `scripts/src/services/openspec/`.
