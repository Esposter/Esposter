# Tasks

## 1. The pure check

- [ ] 1.1 Write the check's cases first: single- and double-quoted haiku agents allowed, and mixed models, a model-less agent, no agent call, a named workflow, an absent script and each construct the mask cannot read refused. See them fail, then write the check and its helpers until they pass. Verify: `pnpm test src/services/resin/checkIsHaikuOnlyScript.test.ts --run` from `packages/genshin-mods` fails with the module missing, then passes with every case green.

## 2. The gate

- [ ] 2.1 Write the gate's cases first, named after the scenarios 'Launching a workflow under a reserve', 'A workflow pinned to haiku under a reserve', 'A saved workflow named under a reserve', 'A script file that is missing under a reserve' and 'The refusal gate failing'. See the haiku-only allow fail, then read the script with `readWorkflowScript` and pass it to `checkIsHaikuOnlyScript` in `registerReserveGate`. Verify: `pnpm test src/services/resin --run` from `packages/genshin-mods` passes with those titles present.
- [ ] 2.2 Confirm the scenario 'A haiku agent launched under a reserve' holds unchanged, since the delegation guard owns the Agent launch. Verify: `pnpm test src/services/delegation --run` from `packages/genshin-mods` passes with `getLaunchRefusal.test.ts` unchanged.

## 3. The record and the checks

- [ ] 3.1 Rewrite the workflow line in `.agents/skills/llm-delegation/SKILL.md` and the reserve's launch paragraph in `.agents/skills/throughput/references/usage-reserve.md` to the haiku rule, so neither says a workflow is refused outright. Verify: `git grep -n "refuses the launch outright\|No hook reads a workflow" -- .agents` prints nothing.
- [ ] 3.2 Format the changed files and run the package's suite. Verify: `pnpm exec oxfmt` over the changed files exits clean, and `pnpm test --run` from `packages/genshin-mods` passes every file.
- [ ] 3.3 Validate the change and its scenarios. Verify: `pnpm exec openspec validate infra-resin-workflow-gate-haiku --strict --no-interactive` passes, and `pnpm -C scripts exec vitest run src/services/openspec` passes.
- [ ] 3.4 At archive, rewrite the resin design's "What is refused at launch" paragraph and the delegation design's workflow sentence as built, naming the old direction as rejected. Verify: after `pnpm exec openspec archive infra-resin-workflow-gate-haiku --yes`, `git grep -n "refused outright\|denies the launch" -- openspec/specs/infra/claude-interface/genshin-mods` prints nothing.
