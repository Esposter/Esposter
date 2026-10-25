# Tasks

Build order. Task 1.1 gates the rest: the schema's rules are set from its counts, not from a guess.

## 1. Scan and schema

- [ ] 1.1 Scan every stored survey, read-only. Count, across the working copies and the published snapshots, each question type, each expression function, nesting depth, model size, and every survey whose question names repeat. Run it as a throwaway scratchpad script, never committed.
      Verify: the counts are written into the Migration section of `design.md` before 1.2 starts, and the scan's log records no write to storage.
- [ ] 1.2 Write the document schema as a Zod schema in `apps/web/shared/models/resource/survey/`, interface-first with its element type derived by name. Its test is written first, one case per scenario in the spec delta, with synthetic fixtures drawn from one construct per question type the scan found.
      Verify: the schema test's case names are the spec delta's scenario names, and every fixture parses while a duplicate name and an unknown type are refused.
- [ ] 1.3 Run the check in `surveyResourceSchema`'s `model` after the JSON-object check, and name the path of the element at fault in the issue.
      Verify: `pnpm test apps/web/shared/models/resource/survey/SurveyResource.test.ts --run` passes, including the case where a stored survey from 1.1's fixtures still saves unchanged.

## 2. Readers and agent path

- [ ] 2.1 Replace the loose `SurveyModelElement` with the schema's element type in the dataset reader, so `getSurveyModelDatasetColumns` reads checked elements.
      Verify: a regression test runs a fixture covering every type from 1.1 through `getSurveyModelDatasetColumns` and asserts the column names and types, and it passes with the old loose type's output unchanged.
- [ ] 2.2 Confirm the agent content tools' survey write reaches the same check, and test that a duplicate name is refused on the tool's path with the same message as the owner's save.
      Verify: the test names the tool's survey write, and its refusal text equals the one `SurveyResource.test.ts` asserts for the owner's save.

## 3. Prose and roadmap

- [ ] 3.1 Sweep the prose that states the old rule. Update the survey resource's as-built data model, the survey row of the agent content tools' schema-fidelity rule, the audit row and its schema-fidelity bullet in the AI-native program design, and the comment in `SurveyResource.ts` that says SurveyJS owns the finer rules.
      Verify: `grep` for "SurveyJS-specific constraints stay unchecked" and "SurveyJS owns the model's finer rules" across `openspec/` (outside `archive/`) and `apps/web` returns nothing.
- [ ] 3.2 Add the licence decision to the resource roadmap as an open item, linking this change's design and naming paid storage tiers as the trigger.
      Verify: the roadmap item links `resource-survey-form-engine/design.md` and `resource-paid-storage-tiers/design.md`, and `openspec validate resource-survey-form-engine --strict --no-interactive` passes.
