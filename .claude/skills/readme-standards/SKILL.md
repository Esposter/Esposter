---
name: readme-standards
description: Esposter README conventions — template, badge rules, and section standards for package READMEs. Apply when creating or updating any README.md file in this monorepo.
---

# README Standards — Esposter

## Template

```markdown
# <package-name>

[badges — see Badge Rules]

One-sentence description (from package.json `description`, expanded for clarity).

## Table of Contents

- 🚀 [Getting Started](#getting-started) ← omit for private packages with no install step
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

## Getting Started ← omit for internal-only packages

(install command + minimal working example)

## Documentation

Link to https://esposter.com/docs/modules/<slug>.html
Key exports table / usage examples / architecture notes

## License

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
| vue-phaserjs    | `vue-phaserjs`              |   no    | `packages/vue-phaserjs/README.md`    |
| xml2js          | `@esposter/xml2js`          |   no    | `packages/xml2js/README.md`          |

## Content Rules

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — install command + one minimal working example. Omit for private packages / any package never installed externally.
3. **Documentation** — always link `https://esposter.com/docs/modules/<slug>.html` with "We highly recommend you take a look at the [documentation](...) to level up." Add a key-exports table or architecture notes so the README is useful without the docs site.
4. **Commands** — list the package's own `pnpm` scripts (build, test, lint:fix, typecheck), not root scripts.
5. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates CLAUDE.md. READMEs are reference docs.
6. **Private packages** — no Getting Started/install section; add an Architecture or How It Works section instead.
7. **Root README** — keep the Packages table in sync when adding/removing packages. Columns: Package (link), Description, Published (✓ or —).
8. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories (e.g. `.../tree/main/packages/shared` vs `.../blob/main/LICENSE`). Never use relative paths — typedoc resolves them as local media and warns if they resolve to directories.
