# README Content

Read when writing a README's description, Getting Started, Documentation link, commands or links.

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — install command + one minimal working example. Omit when the package is neither installed nor run directly — that's every private _library_ package, which jumps straight to Documentation and carries an Architecture / How It Works section instead. `apps/web` is private but **keeps** a Getting Started: it's a runnable app with a real dev setup.
3. **Documentation** — always the sentence "We highly recommend you take a look at the [documentation](...) to level up." Link to the package's specs at `https://github.com/Esposter/Esposter/tree/main/openspec/specs/<slug>` when they exist. Otherwise link to the specs root at `https://github.com/Esposter/Esposter/tree/main/openspec/specs`. A generated package README links the specs root, since a new package has no spec of its own yet.

   Either way add a key-exports table or architecture notes so the README is useful without opening the specs.

4. **Commands** — list the package's own `pnpm` scripts (build, test, lint:fix, typecheck), not root scripts.
5. **Command reference** — a package that is run rather than imported (a CLI, a plugin's slash commands) carries one table of every command it answers to, first under Documentation: the invocation form once above it, then a row per command with its argument and what it does — the ones on no menu included, in their own table. The table is the reference and the prose around it is the explanation; a verb named in prose alone is one nobody finds when they need it.
6. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates `AGENTS.md`. READMEs are reference docs.
7. **Root README** — keep the Packages table in sync when adding/removing packages. Columns: Package (link), Description, Published (✓ or —).
8. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories (e.g. `.../tree/main/packages/shared` vs `.../blob/main/LICENSE`). Never use relative paths.
