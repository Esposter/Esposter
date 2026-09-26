# README Content

Read when writing a README's description, Getting Started, Documentation link, commands or links.

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — install command + one minimal working example. Omit when the package is neither installed nor run directly — that's every private _library_ package, which jumps straight to Documentation and carry an Architecture / How It Works section instead. `apps/web` is private but **keeps** a Getting Started: it's a runnable app with a real dev setup.
3. **Documentation** — always the sentence "We highly recommend you take a look at the [documentation](...) to level up." The link target is the package's **typedoc module page**, at `https://esposter.com/docs/api/modules/<slug>.html`. The `/api` segment is not optional: typedoc's `out` is "apps/web/public/docs/api", so `/docs/` alone is the in-app docs site and `/docs/modules/…` 404s.
   - **Slug** — typedoc mangles a scoped name (`@esposter/foo` → `_esposter_foo`); an unscoped name is literal (`foo` → `foo`). Never spell the slug from the npm name by hand — read it from "apps/web/public/docs/api/modules/".
   - **Which packages have a page** — every workspace member typedoc's `entryPoints` reach (`packages/*`, `typedoc.config.js`) and its `exclude` list does not name (the configuration package). This has nothing to do with the published/private split: a private package still gets a module page. The apps, the configuration package and the root README link the docs site root `https://esposter.com/docs` instead.

   Either way add a key-exports table or architecture notes so the README is useful without the docs site.

4. **Commands** — list the package's own `pnpm` scripts (build, test, lint:fix, typecheck), not root scripts.
5. **Command reference** — a package that is run rather than imported (a CLI, a plugin's slash commands) carries one table of every command it answers to, first under Documentation: the invocation form once above it, then a row per command with its argument and what it does — the ones on no menu included, in their own table. The table is the reference and the prose around it is the explanation; a verb named in prose alone is one nobody finds when they need it.
6. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates CLAUDE.md. READMEs are reference docs.
7. **Root README** — keep the Packages table in sync when adding/removing packages. Columns: Package (link), Description, Published (✓ or —).
8. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories (e.g. `.../tree/main/packages/shared` vs `.../blob/main/LICENSE`). Never use relative paths — typedoc resolves them as local media and warns if they resolve to directories.
