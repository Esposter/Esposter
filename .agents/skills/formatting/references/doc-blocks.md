# Doc Blocks

Read when choosing between `/** */` and `//`.

- **`/** */` is for an exported API surface, `//` for everything else.** A doc block on an exported class, interface or helper is what an editor shows at the call site, which a `//` above the declaration is not; anything internal gets `//`. Its **content** obeys every rule above regardless — a doc block that restates the declaration's own name, or claims something typecheck already proves ("correctly implements the interface"), earns nothing and goes.
  - **A paragraph of prose at module scope keeps `/** */`, whatever it sits above** — the rationale block over a `describe` is the case that arises. `capitalized-comments` rewrites the first letter of every `//` line and leaves a block comment alone, so a wrapped sentence comes back capitalized mid-clause one line in three, and a tool name that lands at a wrap (`ctix`, `pnpm`) comes back as a name that does not exist. The exported-surface rule is about where an editor shows a block; this is about which syntax survives the fixer, and a paragraph only survives as one.
