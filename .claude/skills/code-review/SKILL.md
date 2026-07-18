---
name: code-review
description: The single entry point for every code review — working diff, branch, or PR number. Always runs the project opus-pinned workflow script; never an inline/local review, never the review skill, never the built-in workflow by name. Apply on any review request.
---

# Code Review — One Entry Point

Every review request — `/code-review`, "review this", "review PR N", post-merge audits — goes through the project workflow script. **Never review inline in the session** (reading the diff yourself and reporting findings): inline reviews skip the independent verifiers, burn premium-session tokens on an execution role, and historically missed what the workflow catches. Never use the `review` skill/command — two overlapping commands is how the shallower one gets picked.

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
