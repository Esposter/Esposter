# Embedded recipes

Read when a skill page, a ledger or a docs page is about to embed a command — or when one it already embeds needs a fix.

A recipe pasted into a fence is a program with none of a program's guarantees: nothing typechecks it, nothing lints or formats it, and nothing runs it. It rots in place and the rot is silent, because an unrunnable scan reports nothing and that is the same shape as a clean tree. The repo has carried `python3` blocks that on a Windows checkout print a Microsoft Store notice and **exit 0**, and a `node -e` reader whose every repair was found by an agent whose run failed.

## The line

A recipe stays **inline** while it is one command whose whole logic is its pattern or its query — a grep, a single `gh api … --jq` selection, a `git diff --name-only … | wc -l`. It is read at a glance, and it fails loudly or not at all.

It **migrates** to a script when either of two things happens:

- **It gains control flow** — a loop, a branch, a fallback, a second process aggregating the first's output.
- **It needs a fix.** A fix is proof that nothing ran the block between fixes, and the trap the fix closes is a test case rather than a paragraph explaining the trap. A block repaired in place is a block that will be repaired again.

Length is not a trigger: a long `--jq` expression that is still one selection stays, and a three-line `if` does not.

**A code example is not a recipe.** A fence teaching a convention — what a composable looks like, what the banned form is — is read rather than run, and it never migrates however much control flow it shows. The question is whether a reader is meant to execute the block.

## Where it goes

`scripts/src/<domain>/<verb>/index.ts`, with the pure functions beside it as `get*`/`check*` files and a colocated test each — the shape the sweep scans already have. `scripts/` is in every typecheck, lint, format and test glob, so a migrated recipe gets all of it for the price of a folder, and no runner, project or config entry is added.

The domain folder is named for **what the tooling is about**, never for who runs it. The audience is carried by the script name, and an `ai/` folder would rewrite every `#src/…` import to say what the manifest already says.

**Nothing in `.agents/` is executable.** The tree is the rules an agent reads; an executable in it makes "rule or tool" unanswerable from the path. A vitest project over `.agents/**/*.test.ts` existed for that and went out again.

## Naming: the `ai:` prefix

A pnpm script whose only caller is an agent is named **`ai:<domain>:<verb>`** — `ai:sweep:<scan>`, `ai:coderabbit:<verb>`. The prefix is decided by **audience**, not by what the script does or where it lives: a script a person types after a manifest edit or a version bump keeps its plain name.

It is a name, not a guard — nothing stops a person running one. It answers the question a manifest reader actually has, which is which entries are not for them. Both manifests carry the same name: the owning package declares the `tsx` command, the root delegates with `pnpm -C <package> run <same name>` (`package-scripts` skill).

## What the page keeps

The invocation and the reasons: why the recipe is not a grep, what its output means, which of its silences are lies. What it loses is the body and every paragraph that existed to explain a trap inside the body — those become the tests, which say it better and fail when they stop being true.

A migration is finished when the page names the script, the script has a test for each trap the prose used to carry, and both manifests plus the script-table rows name it.
