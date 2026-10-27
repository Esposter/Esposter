# keyframe-store

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Content-addressed version storage for documents handed over whole, where every version is a zstd **keyframe**, compressed on its own, or a **delta** against a keyframe.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i keyframe-store
```

```ts
import { createKeyframeStore } from "keyframe-store";

const objects = new Map<string, Uint8Array>();
const keyframeStore = createKeyframeStore({
  delete: async (keys) => {
    for (const key of keys) objects.delete(key);
  },
  read: async (key) => objects.get(key),
  // Create-only: false tells the store another writer of the same content landed first
  write: async (key, bytes) => {
    if (objects.has(key)) return false;

    objects.set(key, bytes);
    return true;
  },
});

// Every operation is a neverthrow ResultAsync. The first version of a lineage has no keyframe yet
const first = await keyframeStore.write(Buffer.from(JSON.stringify(document)), { anchoredBytes: 0, hash: "" }).match(
  (writtenVersion) => writtenVersion,
  (error) => {
    throw error;
  },
);
// first.baseHash === "" — it became the keyframe, so the lineage's anchor is its hash
const second = await keyframeStore
  .write(Buffer.from(JSON.stringify(editedDocument)), { anchoredBytes: 0, hash: first.hash })
  .match(
    (writtenVersion) => writtenVersion,
    (error) => {
      throw error;
    },
  );
// second.baseHash === first.hash and second.storedBytes is roughly the size of the edit
const plaintext = await keyframeStore.read(second.hash).match(
  (bytes) => bytes,
  (error) => {
    throw error;
  },
);
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/keyframe-store) to level up. The object format on disk and the contract a caller writes and reads through are specified there.

Each delta is compressed against exactly one keyframe, using that keyframe's plaintext as the dictionary. Reconstructing any version is at most two reads, a version whose content is already held costs nothing, and the backend is anything that can store bytes by key.

### Key exports

| Export                 | Role                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createKeyframeStore`  | The factory, taking an `ObjectStore` and optional `KeyframeStoreOptions`                                                                                                  |
| `KeyframeStore`        | `write(plaintext, anchor)`, `read(hash)`, `collect(released, retained)` — every one a `ResultAsync`                                                                       |
| `KeyframeStoreOptions` | `compressionLevel`, `promotionRatio`, `segmentBudgetRatio`, each defaulted from `constants` — the level from `@esposter/shared`'s, which the app's browser encoder shares |
| `ObjectStore`          | The backend interface — `read`, `write`, `delete` by key                                                                                                                  |
| `VersionAnchor`        | What a lineage passes to a write: its keyframe's hash and the bytes anchored to it                                                                                        |
| `WrittenVersion`       | What a write reports: the hash, its base, both sizes and whether it was deduplicated                                                                                      |

## <a name="commands">⌨️ Commands</a>

Run from `packages/keyframe-store/`:

```bash
pnpm bench        # the codec benchmark, writing the colocated *.bench.md
pnpm build        # compile to dist/
pnpm lint         # lint the package
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [neverthrow](https://github.com/supermacro/neverthrow)
- [Vitest](https://vitest.dev/guide/)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/keyframe-store/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/keyframe-store/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/keyframe-store/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/keyframe-store.svg
