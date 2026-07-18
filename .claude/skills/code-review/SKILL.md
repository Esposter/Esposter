---
name: code-review
description: The single entry point for every code review — working diff, branch, or PR number. Always runs the project opus-pinned workflow script; never an inline/local review, never the review skill, never the built-in workflow by name. Apply on any review request.
---

# Code Review — One Entry Point

Every review request — `/code-review`, "review this", "review PR N", post-merge audits — goes through the project workflow script. **Never review inline in the session** (reading the diff yourself and reporting findings): inline reviews skip the independent verifiers, burn premium-session tokens on an execution role, and historically missed what the workflow catches. Never use the `review` skill/command — two overlapping commands is how the shallower one gets picked.

## Always an Independent Second Pass Over the Whole PR

This workflow is a **separate, independent checker that runs in addition to CodeRabbit, never instead of it** — the whole point is redundant coverage so what one reviewer misses the other catches. CodeRabbit reviews incrementally (only new commits per push) and routinely misses findings; this workflow re-derives findings from scratch with its own finders + independent verifiers.

So when the ask is "review the PR" (not just "review my last change"), target the **entire PR diff** (`target` = the PR number), not only the newest commit — re-check every file in the PR, including ones CodeRabbit already saw and ones an earlier local review already passed. Scoping the second pass to just the new changes defeats the redundancy. Run it after CodeRabbit has finished (check its state per the coderabbit skill) so the two passes are both complete before the PR is considered reviewed.

## Invocation

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "<level> [target]" });
```

- `level` — `high` (default), `xhigh`, or `max`. Post-merge PR audits in this project run `high` unless asked otherwise.
- `target` — optional: PR number, branch, ref range, path, or free-form instructions (`"only review src/foo.ts"`). Omit for the working diff.
- **Never `Workflow({ name: "code-review" })`** — name resolution always loads the built-in, which inherits the premium session model onto ~20 finder/verifier agents (verified 2026-07-17, ~1.46M tokens). The project script pins `model: "opus"` on every agent (execution role per the model-delegation skill).
- `args: "probe"` exits instantly with `{ probe: true }` — free parse check after editing the script.

## Handling findings

1. Verify each finding against current HEAD before fixing — post-merge findings can be stale (fixed by a later commit, file renamed).
2. Fix confirmed findings; disposition PLAUSIBLE ones explicitly (fix or by-design rationale) in the report.
3. Verify per the package-scripts skill (typecheck → tests), then commit per the git skill. Before pushing to a branch with an open PR, check CodeRabbit state (coderabbit skill).
