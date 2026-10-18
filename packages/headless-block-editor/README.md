# headless-block-editor

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless block editor: a typed node tree over a registry, the commands that edit it as JSON Patch operations, navigation and undo history, with no framework or DOM.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i headless-block-editor
```

A registry declares its root, the content types the root accepts and the props schema its props pass, beside its types. `renderBlockNodes` folds a checked document into a consumer's output, rendering each node once its slots have rendered.

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/headless-block-editor/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/headless-block-editor/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/headless-block-editor/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/headless-block-editor.svg
