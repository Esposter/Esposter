# hosted-assets

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Content-addressed objects under a product's committed lock, one url builder, one cache contract and one preloader for any product that loads its files by url. Its preload holds a product's files in the browser's cache behind a loading bar, then evicts the entries under the product's scopes that its set no longer names.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/architecture/hosted-assets).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. Install the package.

```bash
pnpm i hosted-assets
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                     | Kind     | Purpose                                                                                                              |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `HOSTED_ASSETS_CACHE_NAME` | const    | The one Cache Storage every product's objects are kept in                                                            |
| `HostedAssetPreloadStatus` | const    | Where a preload stands: idle, downloading, ready, or failed                                                          |
| `getHostedAssetUrl`        | function | The url an object is served at under an origin, named by its scope, its sha256 and its extension                     |
| `hostedAssetLockSchema`    | schema   | A product's committed lock: its `objects` and `indexes`, each entry a sha256, a byte count, a scope and an extension |
| `useHostedAssetsPreload`   | function | A product's preload behind its loading bar, with `downloadProgress`, `status` and `onHeld`                           |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/hosted-assets/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/hosted-assets/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/hosted-assets/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/hosted-assets.svg
