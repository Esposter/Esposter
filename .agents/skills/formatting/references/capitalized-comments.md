# `capitalized-comments` and the rewrapped comment

Read when oxlint's `capitalized-comments` fires on a `//` line, or after rewrapping any comment block — the grep that finds an identifier pushed to a line front, and the re-read a rewrap owes. The rule that a comment is never reworded to satisfy the linter is in `SKILL.md`.

**Don't fight `eslint(capitalized-comments)`** — oxlint enforces an uppercase first letter on every `//` line, so a wrapped sentence shows a mid-sentence capital on its continuation line. That's fine, and lowercasing one to read better is a lint error rather than a style choice. What it cannot see is the difference between a prose word and a code identifier, so a wrapped line starting with `node_modules`, `pnpm` or `oxlint` gets capitalized into a name that does not exist — and `--fix` writes it. Rewrap so a line starts with prose; a line opening on a backtick or a bracket is exempt, which is why `` `pnpm build` `` may start one.

**Rewrapping a comment is what creates this**, so it is the edit to re-check rather than the original text. Changing a word early in a block reflows every line after it, and an identifier that sat mid-line lands at the front of one — the corruption is written by the pass that was fixing the previous one. After editing any comment, grep the added lines for a line-initial identifier before committing:

```bash
git diff -U0 | grep -E '^\+\s*//\s+([A-Z][a-z]+[A-Z-][a-zA-Z]*|(Pnpm|Oxlint|Tsdown|Tinybench|Sdk|Sas)\b)'
```

Two shapes, because one pattern cannot express both. The first catches an identifier with a later capital to anchor on (`ToPrecision`, `Vue-tsc`); a one-word name (`Pnpm`, `Tinybench`) has none, so it is caught by enumeration instead — the comments ledger keeps that list, since it only grows when a new tool name turns up. Broadening the first to any capitalized token is not the fix: `capitalized-comments` capitalizes _every_ continuation line, so it would match nearly all of them.

Most hits are prose (`Non-Vue`, `Selector-based`) or a real PascalCase name; what fails is a camelCase or lowercase one (`toPrecision`, `tinybench`, `vue-tsc`, `pnpm`).

**Read the joined sentence, not the new opening word.** The fix moves an identifier off the line front by
putting prose in front of it, and the prose has to agree with the line _above_ — which the editor is no longer
looking at. Both failures are silent: the previous line's article is repeated (`… the FORCE_COLOR level string
the` / `The supports-color convention uses`), or its verb loses the object the identifier was (`… a fork run
stacks` / `The upperDirectory becomes a read-only lower`). Neither is a lint error and neither is a broken build; a
reviewer reads it as a dropped word, because it is one. After a rewrap, read the block start to finish with the
leading capitals ignored. Backticking the identifier is the fix that cannot do this — a line opening on a
backtick is exempt from the rule, so the sentence is left alone.
