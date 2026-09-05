# Find recipes

Read when writing or fixing the scan a ledger points a pass at, or deciding where it lives.

A find recipe pasted into a ledger is a program with none of a program's guarantees: nothing typechecks it,
nothing lints or formats it, and nothing runs it, so it rots in place and the rot is silent — an unrunnable scan
reports nothing, which is the shape of a swept tree. Two of this repo's ledgers carried `python3` blocks that on
a Windows checkout print a Microsoft Store notice and **exit 0**.

So the line is what the recipe is, not how long it is:

- **A grep stays inline.** One command whose whole logic is its pattern is read at a glance, and it fails loudly
  when it fails at all. The ledger is the right home for it.
- **Anything with control flow moves to `scripts/sweeps/<scanName>/`**, beside the other root scripts — a bracket
  matcher, a tokenizer, a two-pass scan over a corpus. It is then typechecked by the root `tsc`, linted by the
  root ESLint and oxlint, formatted by `oxfmt`, and run by the `scripts` vitest project, all with no
  configuration: the folder is already in every one of those globs. Wire it as `pnpm sweep:<scan-name>` and let
  the ledger's Find recipe be that one line plus why the scan is not a grep.

**The colocated test is the point, not the packaging.** "Prove the scan can fail before believing it passed" is
this skill's rule and it has no way to stay proved while the scan is a code block — each pass either re-does it
by hand or, in practice, does not. As a script, the planted violation is a test case: the scan reports a
module-scope fixture, skips the multi-line arrow, skips the helper file, reads past the `;` inside a string. The
prose that used to explain each trap in the ledger becomes the test that fails when the trap reopens.

**Not `.agents/`.** The tree is the rules an agent reads, and mixing an executable into it makes "is this a rule
or a tool" unanswerable from the path. It was also tried: an `agents` vitest project over `.agents/**/*.test.ts`
existed for the review workflow's scripts and went out with it, taking a third `projects` entry and its
worktree-glob exclusion with it. `scripts/agentDirectories.test.ts` is the shape that stayed — a test **about**
the agent tree, living where the toolchain already looks.

## How a scan comes back empty without being clean

- **`new RegExp` built from a template literal inside `node -e '...'`.** Single quotes hand the backslash to
  Node intact — the **template literal** is the layer that eats it, so a `\b` written for a word boundary reaches
  `new RegExp` as a **backspace character** and the regex matches nothing. It survives a glance because
  `JSON.stringify` renders a real backspace as `\b` as well, so printing `regex.source` looks right. Use a regex
  **literal** (`/\bfoo\b/u`), `String.raw`, or a plain `.includes` — a literal is unaffected, `/getResult\(/u`
  still means an escaped paren. A quoted heredoc (`<<'PY'`, `<<'JS'`) keeps the shell out of it entirely, which
  is why the longer recipes use one; it removes no JavaScript layer, so the same three fixes still apply inside.
- **A filter on the wrong field.** An author login that differs between two APIs, a path prefix that never
  matches, a `--jq` selector against the wrong payload shape — each returns an empty set and exit 0.
- **`**/` in a `git ls-files` pathspec.** A pathspec is not a shell glob: `*` already crosses `/`, so
  `a/b/*.vue` reaches every depth, while `a/b/**/*.vue` insists on a directory between them and silently drops
  every file sitting in `a/b/` itself. The scan then covers almost everything, which is what makes it hard to
  see — the count looks right and the missing files are exactly the top-level ones a new scan is most likely to
  be pointed at. Write the pathspec without `**`.
