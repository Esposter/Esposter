# README Standards — Esposter

Apply when creating or updating any README.md file in this monorepo.

---

## Template

Every package README follows this structure:

```markdown
# <package-name>

[badges — see rules below]

One-sentence description (from package.json `description`, expanded for clarity).

### Table of Contents

- 🚀 [Getting Started](#getting-started) ← omit for private packages with no install step
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## Getting Started ← omit for internal-only packages

(install command + minimal working example)

## Documentation

Link to https://esposter.com/docs/modules/<slug>.html
Key exports table / usage examples / architecture notes

## License

Apache-2.0 reference + badge refs at the bottom
```

---

## Badge Rules

**Published packages** (no `"private": true` in package.json) — include all four:

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

---

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

---

## Content Rules

1. **Description** — lead with what it does, not what it is. "Drizzle ORM schemas and migrations" beats "A library of database schemas".
2. **Getting Started** — show the install command + one minimal working example. Omit for packages that are never installed externally (app, azure-functions, configuration).
3. **Documentation** — always link `https://esposter.com/docs/modules/<slug>.html`. Add a key-exports table or an architecture notes section so the README is useful without visiting the docs site.
4. **Commands** — list the `pnpm` scripts relevant to that package (build, test, lint:fix, typecheck). Use the package's own scripts, not root scripts.
5. **No filler** — skip "we are excited to…", lengthy prose, or content that duplicates CLAUDE.md. READMEs are reference docs.
6. **Private packages** — no "Getting Started / install" section. Add an Architecture or How It Works section instead.
7. **Root README** — always keep the Packages table in sync when adding or removing packages. Table columns: Package (link), Description, Published (✓ or —). Package links use absolute GitHub URLs with `tree/main` (directories); file links use `blob/main`. Example: `https://github.com/Esposter/Esposter/tree/main/packages/shared` vs `https://github.com/Esposter/Esposter/blob/main/LICENSE`.
8. **GitHub URL convention** — `blob/main` for files, `tree/main` for directories. Never use relative paths for GitHub links — typedoc resolves them as local media and warns if they resolve to directories.
