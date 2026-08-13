# Excluding files from CodeRabbit review

Read when deciding whether a file may be excluded, generating the exclusion list, or removing the exclusions. Exclusions go in `path_filters` in `.coderabbit.yaml` on the PR's base branch (SKILL.md § Config Is Read From the PR Base Branch) and are always temporary.

## Deciding whether to exclude at all

**Rarely**, and only when the arithmetic actually closes. Reaching for exclusions is the standing temptation, because the base branch whose `.coderabbit.yaml` would have to change is the default one, and a config commit feels cheaper than a rewind. It usually is not: a genuinely over-budget window is over budget in _substantive_ files, so the handful that qualify (pure renames, import-path-only edits) close nothing. **Measure the qualifying set before proposing exclusions** — against a hundred-file overshoot it is routinely a couple of files.

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

- **Verbatim repetitions of one edit** — the same change applied identically across N files (one shared line deleted from five sibling views). The change is reviewable once, not N times, so **keep one file as the representative and exclude only its twins**. This is the one kind where the excluded files do carry a content change, which makes the representative load-bearing: name it in the yaml comment, so a reader can confirm the change was reviewed rather than take it on trust. Verify the diffs are genuinely identical instead of merely similar — a sibling that also renamed a variable is not a twin. Identical text is necessary and not sufficient: the same line can carry a different meaning in a different file, where the symbol it names is imported from another module, or the call it removes was the only thing holding a subscription open. Read what the line does in each twin, not just what it says — where that reading is not obvious, keep the file in.

A file that was renamed _and_ carries a real logic change still needs review. When in doubt, leave it in.

**Never exclude a file another session is actively editing**, whatever its committed diff looks like. `path_filters` are static: a file whose diff is comment-only today will have its real change swallowed when the in-flight work lands, and nothing announces it.

Never excludable, whatever the budget:

- **Documentation** (`packages/app/content/docs/**`) — docs are the design record, not commentary. A wrong standard there propagates into every change built on it afterward, and prose is precisely what a human reviewer catches and no typechecker can.
- **Agent skills** (`.claude/skills/**`) — a skill binds every future agent session. An unreviewed wrong rule is worse than unreviewed wrong code, because it silently authors more wrong code.
- **Tests** (`*.test.ts`, `*.test-d.ts`) — tests are the behaviour contract. One asserting the wrong thing is a defect that passes CI forever, and "the source it covers is still reviewed" does not catch it — the reviewer sees green assertions and infers the intent from them.
- **Config, schema, and migration inputs** — small diffs with large blast radius.

The rule reduces to: exclude a file only when its diff carries no information a reviewer could act on. Anything else stays in, and the PR gets smaller instead.

## Why per-file, not globs

CodeRabbit's `path_filters` are static globs with no notion of "this file was only renamed". A glob like `!packages/app/app/services/foo/**` excludes that tree for **every future PR**, permanently blinding review of real changes until someone remembers to revert it.

List every excluded file explicitly instead. It is verbose, and that verbosity is the point — a several-hundred-line block is obviously temporary and obviously scoped, where a 3-line glob quietly rots.

Keep permanent structural entries (`!pnpm-lock.yaml`, generated migrations) at the top of `path_filters`, above any temporary block.

## Generating the list

`R100` is git's marker for a rename with no content change — it gets you the pure-rename subset for free:

```bash
git diff --name-status -M <base>..<head> | awk '$1=="R100"{print "    - \"!" $3 "\""}' | sort
```

Import-path-only edits need two conditions, not one — every changed line is an import, **and** the added imports are the removed ones with a different specifier. Blanking the quoted path turns the second into a set comparison, which is what rejects an added symbol or an added package that the first condition alone would wave through:

```bash
git diff --name-only -M <base>..<head> | while IFS= read -r path; do
  # §When to exclude never lets these out, whatever the diff shape says
  case "$path" in
    *.test.ts|*.test-d.ts|packages/app/content/docs/*|.claude/skills/*) continue ;;
    *.yaml|*.yml|*.json|*.config.ts|packages/db-schema/*|packages/app/server/db/migrations/*) continue ;;
  esac
  diff=$(git diff -U0 -M <base>..<head> -- "$path")
  # a mode flip rides in the diff header rather than on a +/- line, so it would survive every
  # filter below and leave a permission change unreviewed
  printf '%s\n' "$diff" | grep -qE '^(old|new|deleted file|new file) mode ' && continue
  # -U0 so context lines can't be mistaken for changes; the +++/--- headers are dropped
  changed=$(printf '%s\n' "$diff" | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)')
  [ -z "$changed" ] && continue
  printf '%s\n' "$changed" | grep -qvE '^[+-][[:space:]]*(import[[:space:]]|$)' && continue
  # a bare side-effect import is sequenced for its effect, and the sort below cannot tell a
  # reordering of them from a repathing. Both quote styles, or a single-quoted one slips through
  printf '%s\n' "$changed" | grep -qE "^[+-][[:space:]]*import[[:space:]]+[\"']" && continue
  # an import attribute value is quoted too (`with { type: "json" }`), so blanking every quoted
  # string would normalize a changed attribute away. A line carrying a second quoted value stays in
  # the review set rather than being classified
  printf '%s\n' "$changed" | grep -qE '"[^"]*"[^"]*"' && continue
  # every quoted string blanked, so two lines match only if the specifier was the sole difference
  blank() { printf '%s\n' "$changed" | grep "^[$1]" | sed -E 's/^.//; s/"[^"]*"/""/g' | sort; }
  [ "$(blank +)" = "$(blank -)" ] && echo "    - \"!$path\""
done
```

Rename-token-only edits are not `R100` (they have a content diff), but when the sweep landed as **its own commit** they can be classified **exactly** — by replaying the substitution and demanding the result reproduce the committed blob byte-for-byte. Never classify by line counts: a token substitution rewrites each affected line in place, so `--numstat` is symmetric, but a balanced logic edit is symmetric too and the filter cannot tell them apart.

Set `SED` to the sweep's substitutions (one `-e` per rename) — GNU sed, whose `\b` word boundary the identifier substitutions rely on — then:

```bash
set -euo pipefail
SHA=<rename-sha> SED='s/\bOldName\b/NewName/g'
# a partial path list silently under-protects files, so build it in a checked loop rather than
# `grep -v | xargs` — an empty commit list must not fall through to `git show` on HEAD
otherPaths=$(mktemp)
trap 'rm -f "$otherPaths"' EXIT
# every sibling commit in the range, not just one — a file any of them touched is reviewable
git rev-list <base>..<head> | while IFS= read -r commit; do
  [ "$commit" = "$SHA" ] && continue
  git show --name-only --format="" "$commit"
done | sort -u > "$otherPaths"
git diff -M --name-status "$SHA^" "$SHA" | while IFS=$'\t' read -r status old new; do
  # R carries old and new paths; M reuses the one path. A/D are content decisions, never mechanical
  case "$status" in
    R*) path_old="$old"; path_new="$new" ;;
    M)  path_old="$old"; path_new="$old" ;;
    *)  continue ;;
  esac
  # both paths are tested: a rename out of a protected tree is still a change to that tree, and a
  # sibling commit that touched the pre-rename path is a content change this file carries
  isKept=""
  for path in "$path_old" "$path_new"; do
    # §When to exclude never lets these out, whatever the diff says
    case "$path" in
      *.test.ts|*.test-d.ts|packages/app/content/docs/*|.claude/skills/*) isKept=1 ;;
      *.yaml|*.yml|*.json|*.config.ts|packages/db-schema/*|packages/app/server/db/migrations/*) isKept=1 ;;
    esac
    grep -qxF "$path" "$otherPaths" && isKept=1
  done
  [ -n "$isKept" ] && continue
  # exact: replaying the substitution on the parent must reproduce the committed blob
  if git show "$SHA^:$path_old" | sed "$SED" | cmp -s - <(git show "$SHA:$path_new"); then
    echo "    - \"!$path_new\""
  fi
done
```

`cmp` is the whole guarantee: if replaying the substitution reproduces the file exactly, there is by construction no other content change, so this cannot admit a balanced logic edit. It errs only toward keeping files reviewable — a rename that forced a reformatter rewrap, or a sweep whose `SED` you under-specified, fails the compare and stays in. On a multi-hundred-file sweep the line-symmetry filter it replaces admitted roughly two-thirds of the commit on no evidence at all, where the replay admits only files whose every changed line it can account for.

If the sweep is mixed into a commit carrying other work, there is no parent blob to replay against — read the diffs by hand.

Verify the count matches what you expect before committing, and validate the result parses:

```bash
node -e "
const fs=require('node:fs');
// js-yaml is only a transitive dep, so pnpm's strict layout leaves it unresolvable by bare name -
// reach into .pnpm, but discover the version rather than pinning it.
const [dir]=fs.readdirSync('node_modules/.pnpm').filter((d)=>d.startsWith('js-yaml@'));
const yaml=require('./node_modules/.pnpm/'+dir+'/node_modules/js-yaml');
const d=yaml.load(fs.readFileSync('.coderabbit.yaml','utf8'));
console.log('path_filters:', d.reviews.path_filters.length);
"
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
