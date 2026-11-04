# Tasks

Build order. Tasks that remain open are in the roadmap.

## 2. SurveyJS

- [x] 2.1 Remove SurveyJS: its four catalog entries in `pnpm-workspace.yaml` and `apps/web/package.json`, its two plugins, `parseSurveyModel.ts`, the old theme key constant, the Creator's chunk entry, and the ledger rows. Run `pnpm i` in the same commit.
      Verify: a repo search for `survey-core`, `survey-creator` and `survey-vue3-ui` finds nothing outside the archive folder, and the lockfile holds no SurveyJS package.
- [x] 2.2 Edit the survey entry in the stop list of the dependency admission design to name the owner's decision.
      Verify: the stop list's survey line cites the program.

## 3. Prose

- [x] 3.1 Sweep the prose the program makes stale: the agent content tools' schema-fidelity row, the program audit's survey row, the math expression pointer, the survey resource, summary and invite designs, and the roadmap item.
      Verify: a search for "SurveyJS" across `openspec/` and `apps/web` returns only the rejected and deferred survey pages, the survey-logic and survey-document capability pages that name it as reference evidence, the survey-theme-files page, the `resource-roadmap`, and `archive/`.
- [ ] 3.2 Archive each part into its capability and write the capabilities as built.
      Verify: `pnpm exec openspec validate --strict --no-interactive` passes with no change left under the prefix.
