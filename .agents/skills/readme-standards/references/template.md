# The README Template

Read when writing a README's skeleton or its badges.

## Headings and sections

Headings use the anchor+emoji form, and a `---` rule closes the table of contents. The table of contents links the explicit `name`, not the hyphen-prefixed slug GitHub derives from the emoji (`SKILL.md`, Settled). Every list and table is ordered alphabetically, case-insensitively, except a table grouped by layer, which keeps its layers in the order the stack runs and is alphabetical within each layer. The table of contents and the sections follow the skeleton's order. Importance is not an order, since no measure of it holds still.

A section a package does not need is left out, not left empty: Getting Started with no install or run step, Key Exports with nothing a reader calls, Commands with no command a person runs (`content-rules.md`).

```markdown
# <npm-name>

[badges — see "Badges" on this page]

One-sentence description (from package.json `description`, expanded for clarity).

Design notes live in [the specs](<the specs link — `content-rules.md`>).

## Table of Contents

- 🚀 [Getting Started](#getting-started) ← omit when the package is neither installed nor run
- 🧩 [Key Exports](#key-exports) ← omit when nothing a reader calls is exported
- 📝 [Usage](#usage) ← only when a reader copies an example Getting Started does not already show
- ⌨️ [Commands](#commands) ← only for an app, a plugin or a tool a person runs
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

(install command + minimal working example)

## <a name="key-exports">🧩 Key Exports</a>

(a table of each export a reader calls, and what it does)

## <a name="usage">📝 Usage</a>

(one code block a reader copies, with the import it needs)

## <a name="commands">⌨️ Commands</a>

(the commands a person runs, one per line; a plugin's command reference table)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge references — see "Badges"]
```

## Badges

**Published packages** (no `"private": true`) — all four:

```markdown
[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]
```

**Private packages** — the licence badge alone:

```markdown
[![Apache-2.0 licensed][badge-license]][url-license]
```

Badge colours are the brand's: the Standard style of `apps/web/configuration/UiPaletteMap.ts`, the app's default (`DEFAULT_UI_STYLE`). A shield carries white label text, so a badge takes the light-mode tone rather than the dark one: success `1b7a5f` for the npm version, info `0b6ac0` for the licence. GitHub strips `style` attributes from markdown, so the palette reaches the badges and nothing else.

Badge ref format (bottom of file):

```markdown
[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=0b6ac0
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/<npm-name>/latest?color=1b7a5f
[url-npm]: https://www.npmjs.com/package/<npm-name>/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/<npm-name>/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/<npm-name>.svg
```
