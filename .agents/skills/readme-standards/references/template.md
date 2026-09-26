# The README Template

Read when writing a README's skeleton or its badges.

## Headings and sections

Headings use the anchor+emoji form and a `---` rule closes the ToC — the ToC links the explicit `name`, not the
hyphen-prefixed slug GitHub derives from the emoji (`SKILL.md`, Settled). Copy the shape from a sibling README:

```markdown
# <npm-name>

[badges — see below]

One-sentence description (from package.json `description`, expanded for clarity).

## Table of Contents

- 🚀 [Getting Started](#getting-started) ← omit when the package has no install/run step
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

(install command + minimal working example)

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](<the typedoc module page — `references/content-rules.md`>) to level up.
Key exports table / usage examples / architecture notes

## <a name="license">⚖️ License</a>

Apache-2.0 reference + badge refs at the bottom
```

## Badges

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
