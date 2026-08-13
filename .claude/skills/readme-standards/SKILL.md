---
name: readme-standards
description: Esposter README conventions — the anchor+emoji heading template, the published-vs-private split that drives the badges, the typedoc module-page URL and scoped-name slug mangling that drive the docs link, when Getting Started is omitted, reading published-vs-private off each manifest rather than a list, and GitHub blob/tree URL rules. Apply when creating or updating any README.md in this monorepo, including the root one.
---

# README Standards — Esposter

## Template

Headings use the anchor+emoji form and a `---` rule closes the ToC. Copy the shape from a sibling README:

```markdown
# <npm-name>

[badges — see Badge Rules]

One-sentence description (from package.json `description`, expanded for clarity).

## Table of Contents

- 🚀 [Getting Started](#getting-started) ← omit when the package has no install/run step
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

(install command + minimal working example)

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](<see rule 3>) to level up.
Key exports table / usage examples / architecture notes

## <a name="license">⚖️ License</a>

Apache-2.0 reference + badge refs at the bottom
```

## Badge Rules

**Published packages** (no `"private": true`) — include all four:

```markdown
[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]
```

**Private packages** — license badge only:

```markdown
[![Apache-2.0 licensed][badge-license]][url-license]
```

Badge ref format (bottom of file):

```markdown
[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/<npm-name>/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/<npm-name>/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/<npm-name>/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/<npm-name>.svg
```

## Which packages, and which are published

Every package carries a `README.md` at its own root. Whether it is published is `private` in its `package.json`, and its npm name is that manifest's `name` — both read from the source rather than from a list here, which would rot the first time a package is added. `AGENTS.md` carries the inventory with a description per package, the one thing the tree cannot answer.

## Content Rules

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — install command + one minimal working example. Omit when the package is neither installed nor run directly — that's every private _library_ package (`configuration`, `db`, `db-mock`, `db-schema`, `shared-node`, `azure-functions`, `infra`), which jump straight to Documentation and carry an Architecture / How It Works section instead. `packages/app` is private but **keeps** a Getting Started: it's a runnable app with a real dev setup.
3. **Documentation** — always the sentence "We highly recommend you take a look at the [documentation](...) to level up." The link target is the package's **typedoc module page**, at `https://esposter.com/docs/api/modules/<slug>.html`. The `/api` segment is not optional: typedoc's `out` is `packages/app/public/docs/api`, so `/docs/` alone is the in-app docs site and `/docs/modules/…` 404s.
   - **Slug** — typedoc mangles a scoped name (`@esposter/foo` → `_esposter_foo`); an unscoped name is literal (`foo` → `foo`). Never spell the slug from the npm name by hand — read it from `packages/app/public/docs/api/modules/`.
   - **Which packages have a page** — every package **not** in typedoc's `exclude` list (`typedoc.config.js`), which is the app and the configuration package. This has nothing to do with the published/private split: a private package still gets a module page. Those two, and the root README, link the docs site root `https://esposter.com/docs` instead.

   Either way add a key-exports table or architecture notes so the README is useful without the docs site.

4. **Commands** — list the package's own `pnpm` scripts (build, test, lint:fix, typecheck), not root scripts.
5. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates CLAUDE.md. READMEs are reference docs.
6. **Root README** — keep the Packages table in sync when adding/removing packages. Columns: Package (link), Description, Published (✓ or —).
7. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories (e.g. `.../tree/main/packages/shared` vs `.../blob/main/LICENSE`). Never use relative paths — typedoc resolves them as local media and warns if they resolve to directories.
