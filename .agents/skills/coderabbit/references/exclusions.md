# Excluding files from CodeRabbit review

Read when deciding whether a file may be excluded, generating the exclusion list, or removing the exclusions. Exclusions go in `path_filters` in `.coderabbit.yaml` on the PR's base branch (SKILL.md § Config Is Read From the PR Base Branch) and are always temporary.

## Deciding whether to exclude at all

**Rarely**, and only when the arithmetic actually closes. Reaching for exclusions is the standing temptation, because the base branch whose `.coderabbit.yaml` would have to change is the default one, and a config commit feels cheaper than a rewind. It usually is not: a genuinely over-budget window is over budget in _substantive_ files, so the handful that qualify (pure renames, import-path-only edits) close nothing. **Measure the qualifying set before proposing exclusions** — against a hundred-file overshoot it is routinely a couple of files.

**A refactor sweep is the standing exception, and it is not a small one.** A sweep that extracts shared definitions puts most of its files in the call-site-only category below, where a quarter of the window can qualify — enough to close a twenty-file overshoot on its own. Measure it the same way regardless; what makes the sweep different is that the measurement comes back large, not that it may be skipped.

**The exception is a small overshoot.** When the window is over by single digits _and_ the qualifying set covers the gap on its own, a temporary exclusion is the cheaper recovery, because the alternative is rewinding a shared branch. Prefer it outright when someone else is working on that branch: a cut rewrites history under them, an exclusion touches only the base. The bar on each file does not move (§ When to exclude below), and inventing headroom by excluding substantive files is the thing this rule exists to stop. The procedure:

1. Read the skip comment for the real overshoot (`N files exceed the limit of M`); do not compute it from the merge-base.
2. Classify the window and count what genuinely qualifies. If it does not cover the gap **with margin**, stop and cut instead — landing exactly on the cap leaves nothing for the next push.
3. A change repeated verbatim across N files (one identical line deleted from five views) is reviewable **once**: keep one file as the representative, exclude its twins, and name the representative in the yaml comment so the next reader can check the claim. Identical patch text is the entry condition, not the test — the twin qualifies only if the line _means_ the same thing there, same symbols resolving to the same modules and the same runtime effect (§ When to exclude below).
4. Commit the block to the PR's resolved base branch (`gh pr view <pr> --json baseRefName --jq .baseRefName`) with its revert subject, retrigger with `@coderabbitai review` — no push to the head branch is needed, and none should be made, since the config is read from the base branch and a push would only add files to the same window.
5. Remove the block once that review completes. An exclusion left behind blinds the next review of those paths silently.

## When to exclude

Chunk at the budget where you can. A mechanical rename can't be chunked — it's one atomic commit — so exclude the files within it that carry no reviewable content.

The other case is a **small overshoot on an already-pushed window** (SKILL.md § PR File Budget): the push is spent, the cap is exceeded by single digits, and the alternative is rewinding a branch someone else is working on. The bar per file is identical — what changes is only that the exclusion is worth doing at all.

**Every exclusion is derived from an open PR's diff.** Enumerate what that PR actually changed, classify each file, and list the ones that qualify. Never write an exclusion for a file class the repo merely _could_ produce — a speculative glob block (generated artifacts, binaries, vendored assets) added outside a PR is unreviewed config change for no benefit, and it silently blinds every later PR that does touch those paths. A class earns a permanent entry only when a real PR puts it in a diff.

Exclude only files with **no reviewable content change**. Four kinds qualify:

- **Pure renames** — 100% similarity, zero content change (`R100`).
- **Rename-token-only edits** — the file's only diff is the mechanical substitution itself (every `OldName` identifier → `NewName`). A temporary block covering both kinds says so in its header comment.
- **Import-path-only edits** — a module moved (`@/` → `#shared`, say) and the file's entire diff is the same imports pointing at the new path. "Every changed line is an `import`" is _not_ the test: a new symbol, a new package, or an added side-effect import is a real change that passes it. The test is that the added and removed imports pair up with **only the quoted specifier differing** — same symbols, same shape, new module.

- **Call-site-only substitutions** — the file's entire diff swaps an inlined expression for a call to a definition the _same change_ adds (an extracted helper, a hoisted constant, a map replacing a lookup function). This is the sweep-shaped generalisation of the twin rule below: the reviewable content is the extraction itself, and it lives in one place. **The definition is never excluded** — that is what keeps the change reviewed exactly once rather than zero times, so an exclusion whose definition file is not in the same window is invalid. The test is that every changed line is either the import of the new definition or a call to it, with the substituted expression reproduced by the definition's body; a call site that also renames a variable, reorders an argument, or changes what happens on the empty case is a real change and stays in. A **deletion** whose logic moved wholesale into the new definition qualifies on the same grounds. Sibling call sites of one extraction are all excludable together — unlike the twin rule, there is no representative to keep, because the definition already is one.

- **Verbatim repetitions of one edit** — the same change applied identically across N files (one shared line deleted from five sibling views). The change is reviewable once, not N times, so **keep one file as the representative and exclude only its twins**. This is the one kind where the excluded files do carry a content change, which makes the representative load-bearing: name it in the yaml comment, so a reader can confirm the change was reviewed rather than take it on trust. Verify the diffs are genuinely identical instead of merely similar — a sibling that also renamed a variable is not a twin. Identical text is necessary and not sufficient: the same line can carry a different meaning in a different file, where the symbol it names is imported from another module, or the call it removes was the only thing holding a subscription open. Read what the line does in each twin, not just what it says — where that reading is not obvious, keep the file in.

A file that was renamed _and_ carries a real logic change still needs review. When in doubt, leave it in.

**Never exclude a file another session is actively editing**, whatever its committed diff looks like. `path_filters` are static: a file whose diff is comment-only today will have its real change swallowed when the in-flight work lands, and nothing announces it.

Never excludable, whatever the budget:

- **Documentation** (`apps/web/content/docs/**`) — docs are the design record, not commentary. A wrong standard there propagates into every change built on it afterward, and prose is precisely what a human reviewer catches and no typechecker can.
- **Agent skills** (`.agents/skills/**`) — a skill binds every future agent session. An unreviewed wrong rule is worse than unreviewed wrong code, because it silently authors more wrong code.
- **Tests** (`*.test.ts`, `*.test-d.ts`) — tests are the behaviour contract. One asserting the wrong thing is a defect that passes CI forever, and "the source it covers is still reviewed" does not catch it — the reviewer sees green assertions and infers the intent from them.
- **Config, schema, and migration inputs** — small diffs with large blast radius.

The rule reduces to: exclude a file only when its diff carries no information a reviewer could act on. Anything else stays in, and the PR gets smaller instead.

## Why per-file, not globs

CodeRabbit's `path_filters` are static globs with no notion of "this file was only renamed". A glob like `!apps/web/app/services/foo/**` excludes that tree for **every future PR**, permanently blinding review of real changes until someone remembers to revert it.

List every excluded file explicitly instead. It is verbose, and that verbosity is the point — a several-hundred-line block is obviously temporary and obviously scoped, where a 3-line glob quietly rots.

Keep permanent structural entries (`!pnpm-lock.yaml`, generated migrations) at the top of `path_filters`, above any temporary block.

## Generating the list

```bash
pnpm ai:coderabbit:exclusions "<base>..<head>"
pnpm ai:coderabbit:exclusions "<base>..<head>" <rename-sha> OldName=NewName [OldName=NewName ...]
```

It prints the `path_filters` lines for every file the range lets out, sorted, under a comment counting them against the files changed — and never a file § When to exclude protects (a test, a docs page, a skill, a config, schema or migration input), however its diff reads. Three of the four kinds are decided mechanically:

- **Pure renames** — `R100`, git's marker for a rename with no content change.
- **Import-path-only edits** — every changed line is an import, **and** the added imports are the removed ones with only the quoted specifier differing. The second condition is what rejects an added symbol or an added package the first would wave through; a side-effect import, a mode flip in the diff header and an import attribute each keep their file in the review set, for a reason the classifier's test states.
- **Rename-token-only edits**, when the sweep landed as its own commit — the second form. Each `OldName=NewName` is replayed word-bounded on the parent blob, and the file qualifies only when the result reproduces the committed blob byte for byte: then there is by construction no other content change, so a balanced logic edit cannot be admitted, and the filter errs only toward keeping files reviewable — a reformatter rewrap or an under-specified rename fails the compare. A file any sibling commit in the range also touched stays in, under either of its paths. Never classify these by line counts: a token substitution rewrites each affected line in place, so `--numstat` is symmetric, but a balanced logic edit is symmetric too.

If the sweep is mixed into a commit carrying other work, there is no parent blob to replay against — read the diffs by hand. Call-site-only substitutions and verbatim repetitions are read rather than computed, because both need the definition or the representative judged against its twins.

Verify the count matches what you expect before committing, and that the block landed as entries rather than prose — an indentation slip shows up as a count that does not match:

```bash
grep -c '^\s*- "!' .coderabbit.yaml
```

## The commit pair

Every exclusion commit names its own revert so the cleanup is unambiguous later.

**Adding** — subject is `chore: exclude <scope> from CodeRabbit review`. The body states why, and quotes the exact removal subject:

```text
chore: exclude <scope> from CodeRabbit review

The <scope> touches <total> files, of which <excluded> are pure renames or
rename-token-only edits with no reviewable content change. Exclude those so the
review stays under the free-tier file limit and focuses on the files that
actually changed.

Revert with "chore: re-enable CodeRabbit review for <scope>" once the <scope> PR
merges.
```

**Removing** — subject is `chore: re-enable CodeRabbit review for <scope>`, reusing the same `<scope>` wording:

```text
chore: re-enable CodeRabbit review for <scope>

The PR has merged, so these files are reviewable again.
```

Mark the temporary block in the yaml with a comment naming its scope, so "remove the exclusions" resolves to an exact set of lines:

```yaml
# pure renames from <scope> (no content change); remove these once that PR merges
```

## Removal procedure

When the user says "remove the exclusions" or "re-enable review":

1. `git switch <base-branch> && git pull --ff-only origin <base-branch>` — **the PR's base branch, not `main` by default.** Removing the block from the wrong branch is a no-op: the live exclusions are on whatever branch PRs are reviewed against, normally `develop`.
2. Delete the commented temporary block from `.coderabbit.yaml`, leaving the permanent entries.
3. Commit as `chore: re-enable CodeRabbit review for <scope>`, taking `<scope>` from the block's comment.
4. Push to that branch.

Verify the block is actually gone from the branch that matters (`git show <base-branch>:.coderabbit.yaml | grep -c '"!'` should drop to the permanent-entry count). If more than one temporary block exists, ask which scope to remove rather than clearing all of them.
