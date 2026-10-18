## 1. Tooling

- [x] 1.1 Write `lintScenarios.test.ts` with a case for each refused shape (no THEN, WHEN after THEN, two THEN steps, prose inside a scenario) and see the cases pass against the service; then deliberately break a spec and see `readSpecFindings.test.ts` fail, and remove the broken spec.
- [x] 1.2 Run `pnpm exec openspec validate adopt-openspec --strict --no-interactive` and `pnpm exec openspec schema validate spec-driven`; both print a valid result.

## 2. Decision record

- [x] 2.1 Delete `apps/web/content/docs/architecture/rejected/spec-frameworks.md` and its row in `rejected/index.md`; `pnpm -C apps/web test content/docs/index.test.ts --run` passes.

## 3. Agent guidance

- [x] 3.1 Add `.agents/skills/openspec/SKILL.md` for how Esposter uses OpenSpec; it links the team kit's `openspec` skill for commands and does not restate it.
- [x] 3.2 Update `AGENTS.md` (Workflow and the ownership table) and the `docs` skill so a new specification goes to `openspec/changes/`; verify with `grep -n "openspec" AGENTS.md .agents/skills/docs/SKILL.md`.
