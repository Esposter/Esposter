## 1. Caller check

- [ ] 1.1 Search the repo for callers of `grill-me` and `eval-harness` (`git grep`, the skill names, the stage commands and the agents) and record each caller — verify the record lists every hit, and decide `eval-harness` by it.
- [ ] 1.2 Diff each agent in the table (`tdd-guide`, `security-reviewer`, `verifier`) against its skill and list the duplicated lines — verify the list is written to design.md before any edit.

## 2. Remove and repoint

- [ ] 2.1 Repoint every caller of `grill-me` to `grilling`, then delete `grill-me` — verify grep finds no `grill-me` outside the attribution in `grilling`.
- [ ] 2.2 Remove `eval-harness` if task 1.1 finds no caller and the user agrees; otherwise leave it — verify the decision is recorded in design.md.

## 3. Owner per job

- [ ] 3.1 Replace each duplicated block found in 1.2 with a load of its skill in the agent — verify the three agents name their skill and the configuration check for restated skills passes.
- [ ] 3.2 Trim the overlapping stack-skill rules (`coding-standards`, `frontend-patterns`, `backend-patterns` against `vue-standards` and `csharp-standards`) so each rule has one language owner — verify by grep that no rule appears in two skills.

## 4. Check

- [ ] 4.1 Add the two `skill-catalogue` checks to Verify-Config and see each fail on the current tree before the edits — verify RED, then GREEN.
- [ ] 4.2 Run `.\scripts\Verify-Config.ps1` and `openspec validate prune-overlapping-skills --strict --no-interactive` — verify both exit 0.
