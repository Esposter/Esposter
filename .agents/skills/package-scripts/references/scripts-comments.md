# `scriptsComments`

Read when a root or package script is shaped by something that should later be undone, and the manifest has to say so.

JSON has no comments, so a script that records something to undo later carries it in a sibling top-level
**`scriptsComments`** object keyed by the script name — never a `"// …"` key inside `scripts`, which pnpm lists as a
runnable script. The value is one `@TODO:` string in the `todos` skill's form — the link to what ends it, then what
to restore — and that is **all** the object holds: why a script is shaped as it is lives in this skill's table and
the docs page that owns it, where the reasoning already sits, so a copy in the manifest is a second one that drifts.

```json
{
  "scriptsComments": {
    "build": "@TODO: https://github.com/TypeStrong/typedoc/issues/3098 — restore `pnpm build:docs` to the chain …"
  }
}
```
