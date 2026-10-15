## Context

Reference counts are a weak signal: a model-invoked skill is loaded by its description, not by a file that names it, so a skill with one reference may still be used. The overlaps are visible from names and descriptions alone (read during planning):

| Job                             | Agent               | Skill             |
| ------------------------------- | ------------------- | ----------------- |
| Failing-test-first process      | `tdd-guide`         | `tdd`             |
| Security review checklist       | `security-reviewer` | `security-review` |
| Run canonical checks and report | `verifier`          | `verify`          |

## Goals / Non-Goals

**Goals:**

- One owner per job.
- No alias skill.

**Non-Goals:**

- Changing what an agent does at a stage. Only where its procedure lives changes.

## Decisions

1. **The skill owns the procedure; the agent names it.** An agent that restates a skill's checklist drifts from it. Rejected: removing the skills and keeping the agents, because the skills are model-invoked outside the stages and the agents are not. Rejected: removing the agents, because `/build` and `/gate` dispatch them by name.
2. **`grill-me` is removed.** It is a 47-word body that only calls `grilling`, and its description duplicates `grilling`'s. The callers move to `grilling`.
3. **`eval-harness` is decided by a caller check, not by its reference count.** If no stage command or agent in this repo calls it, and the user does not want it for a product repo, it is removed. The decision is recorded here when made.

## Risks / Trade-offs

- [Model-invoked use] A removed skill that a model invoked by description stops being loaded. Mitigation: each removal is listed in the PR with its description, so the user sees what stops being available.
- [Attribution] `grill-me` carries the MIT footer for mattpocock/skills. Removing it does not remove the notice, which the README keeps and `grilling` carries.
