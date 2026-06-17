# @esposter/xml2js

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Inspired by [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js).

A complete rewrite from CoffeeScript to TypeScript that removes unnecessary dependencies like `events` — resolving issues such as [`this.removeAllListeners is not a function`](https://github.com/Leonidas-from-XIV/node-xml2js/issues/697). Retains all the options and behaviour of the original `xml2js`. Use `parseStringPromise` as the primary parsing API.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i @esposter/xml2js
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/xml2js.html) to level up.

### Usage

```ts
import { parseStringPromise } from "@esposter/xml2js";

const xml = `<root><child attr="value">text</child></root>`;
const result = await parseStringPromise(xml);
// result: { root: { child: [ { _: 'text', $: { attr: 'value' } } ] } }
```

### Why Not the Original `xml2js`?

The original package pulls in the `events` module which causes runtime errors in certain bundler/edge environments. This rewrite is a drop-in replacement that works cleanly in Node.js, Azure Functions, and browser bundles.

### Commands

Run from `packages/xml2js/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/xml2js/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/xml2js/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/xml2js/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/xml2js.svg
