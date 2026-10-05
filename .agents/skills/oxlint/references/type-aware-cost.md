# Type-aware cost

Read when the oxlint pass slows down, its memory climbs, or one type-aware rule tops the timings table.

Every root oxlint script runs with `--debug=timings`, so the table sits at the end of every lint log — read it before measuring anything else. `OXC_LOG=debug` adds tsgolint's own milestones: the program it builds for each tsconfig and its source-file count, which is where a stall shows up between one program and the next.

**The rule at the top of the table is the one that asked first, not necessarily the cause.** tsgolint's checker computes a type lazily and caches it, so whichever rule first forces an expensive type is billed for all of it. Turning that rule off only hands the bill to the next asker: `no-misused-promises` and `strict-void-return` traded the same cost when one of them was switched off. Before disabling a rule repo-wide, find the files that make it expensive.

Bisect by tree, then by file: `oxlint <dir>` per package, then `oxlint <file>` per file in the slow package, each timed. Then compare against a plain `tsc --noEmit -p <tsconfig>` of the same program. If the compiler is fast, the types are fine, and the blow-up is in the rule's own queries over them.

**The costliest rules repo-wide run only on an occasional pass.** `COSTLY_TYPE_AWARE_SEVERITY` in `oxlint.config.ts` is `"off"` in every run. Each occasional pass flips it to `"error"` for one check-only oxlint run from the root, fixes what that run reports and flips it back to `"off"` in the same commit, carrying the `Ledger: oxlint | …` trailer for that row. A rule that tops the table across the whole repo, with no slow scope to bisect down to, joins that constant. Their disable directives stay, so the stale-directive hunt reports them as unused while the rules are off, and a pass keeps them.

**For a hotspot in a few files, the fix is an `overrides` entry turning the asking rules off in that scope alone**, leaving the rest of the type-aware set running there, never the rule repo-wide; only a cost spread across the repo weighs the rule repo-wide. A type-aware rule's severity is per-file like any other rule's, even though `options.typeAware` itself is not (`references/ignore-patterns.md`), and `ignorePatterns` is only for a hang that keeps tsgo from building the program at all. Re-time the scope after the override to confirm no other rule picks up the cost. The standing entry and the agent forcing it are in `apps/web/content/docs/architecture/lint-toolchain.md`.
