---
name: readme-standards
description: Esposter README conventions — the anchor+emoji heading template, the published-vs-private split that drives both badges and the docs link target, when Getting Started is omitted, the package summary table, and GitHub blob/tree URL rules. Apply when creating or updating any README.md in this monorepo, including the root one.
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

## Package Summary

| Package         | npm name                    | Private | README path                          |
| --------------- | --------------------------- | :-----: | ------------------------------------ |
| app             | `@esposter/app`             |   yes   | `packages/app/README.md`             |
| azure-functions | `@esposter/azure-functions` |   yes   | `packages/azure-functions/README.md` |
| azure-mock      | `azure-mock`                |   no    | `packages/azure-mock/README.md`      |
| configuration   | `@esposter/configuration`   |   yes   | `packages/configuration/README.md`   |
| db              | `@esposter/db`              |   yes   | `packages/db/README.md`              |
| db-mock         | `@esposter/db-mock`         |   yes   | `packages/db-mock/README.md`         |
| db-schema       | `@esposter/db-schema`       |   yes   | `packages/db-schema/README.md`       |
| infra           | `@esposter/infra`           |   yes   | `packages/infra/README.md`           |
| parse-tmx       | `parse-tmx`                 |   no    | `packages/parse-tmx/README.md`       |
| shared          | `@esposter/shared`          |   no    | `packages/shared/README.md`          |
| shared-node     | `@esposter/shared-node`     |   yes   | `packages/shared-node/README.md`     |
| virrun          | `virrun`                    |   no    | `packages/virrun/README.md`          |
| vue-phaserjs    | `vue-phaserjs`              |   no    | `packages/vue-phaserjs/README.md`    |
| xml2js          | `@esposter/xml2js`          |   no    | `packages/xml2js/README.md`          |

## Content Rules

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — install command + one minimal working example. Omit when the package is neither installed nor run directly — that's every private _library_ package (`configuration`, `db`, `db-mock`, `db-schema`, `shared-node`, `azure-functions`, `infra`), which jump straight to Documentation and carry an Architecture / How It Works section instead. `packages/app` is private but **keeps** a Getting Started: it's a runnable app with a real dev setup.
3. **Documentation** — always the sentence "We highly recommend you take a look at the [documentation](...) to level up." The link target follows the published/private split, exactly as the badges do:
   - **Published** → `https://esposter.com/docs/modules/<slug>.html` (the typedoc page for that module).
   - **Private** → bare `https://esposter.com/docs/` — there is no typedoc module page for an unpublished package, so a `/modules/` link would 404.

   Either way add a key-exports table or architecture notes so the README is useful without the docs site.

4. **Commands** — list the package's own `pnpm` scripts (build, test, lint:fix, typecheck), not root scripts.
5. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates CLAUDE.md. READMEs are reference docs.
6. **Root README** — keep the Packages table in sync when adding/removing packages. Columns: Package (link), Description, Published (✓ or —).
7. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories (e.g. `.../tree/main/packages/shared` vs `.../blob/main/LICENSE`). Never use relative paths — typedoc resolves them as local media and warns if they resolve to directories.
