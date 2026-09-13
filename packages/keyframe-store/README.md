# keyframe-store

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Content-addressed version storage for documents handed over whole. Every version is stored as a zstd **keyframe** — compressed on its own — or as a **delta** compressed against exactly one keyframe, using that keyframe's plaintext as the dictionary. Reconstructing any version is at most two reads, a version whose content is already held costs nothing, and the backend is anything that can store bytes by key.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
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
  delete: async (keys) => keys.forEach((key) => objects.delete(key)),
  read: async (key, byteCount) => objects.get(key)?.subarray(0, byteCount),
  write: async (key, bytes) => void objects.set(key, bytes),
});

// The first version of a lineage has no keyframe yet
const first = await keyframeStore.write(Buffer.from(JSON.stringify(document)), { anchoredBytes: 0, hash: "" });
// first.baseHash === "" — it became the keyframe, so the lineage's anchor is its hash
const second = await keyframeStore.write(Buffer.from(JSON.stringify(editedDocument)), {
  anchoredBytes: 0,
  hash: first.hash,
});
// second.baseHash === first.hash and second.storedBytes is roughly the size of the edit
const plaintext = await keyframeStore.read(second.hash);
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/keyframe-store.html) to level up.

### How it works

- **Addressing.** An object's key is the hex SHA-256 of its plaintext, so two versions with identical content resolve to one object whichever keyframe either would have been encoded against. The store is write-once: a write of content it already holds records nothing and reports itself deduplicated.
- **Encoding.** Each write compresses the plaintext standalone and, when the lineage has a keyframe, again with that keyframe's plaintext as the dictionary. The delta is kept only if it is at most the **promotion ratio** of the standalone size _and_ the bytes already anchored to the keyframe plus this delta fit the **segment budget**; otherwise the standalone form is written and this version becomes the lineage's next keyframe.
- **Reading.** A keyframe is one read and one decompression; a delta fetches the keyframe its own header names, decompresses it, then decompresses the delta against it. Every result is hashed and compared with the key, so a truncated, altered or misfiled object is a refused read rather than a plausible document.
- **Collection.** An object survives while any record names it, as its own hash or as its base. The caller answers that from its own records — `collect` takes the hashes an eviction released and the hashes still named, deletes the difference, and returns what it deleted.
- **The anchor is the caller's.** The store holds no notion of a lineage: a caller derives one anchor per history — the newest keyframe's hash, and the bytes anchored to it — and resets both whenever a write reports an empty base.

### Key exports

| Export                 | Role                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `createKeyframeStore`  | The factory, taking an `ObjectStore` and optional `KeyframeStoreOptions`                            |
| `ObjectStore`          | The backend interface — `read`, `write`, `delete` by key                                            |
| `KeyframeStore`        | `write(plaintext, anchor)`, `read(hash)`, `collect(released, retained)` — every one a `ResultAsync` |
| `VersionAnchor`        | What a lineage passes to a write: its keyframe's hash and the bytes anchored to it                  |
| `WrittenVersion`       | What a write reports: the hash, its base, both sizes and whether it was deduplicated                |
| `KeyframeStoreOptions` | `compressionLevel`, `promotionRatio`, `segmentBudgetRatio`, each defaulted from `constants`         |

### Commands

Run from `packages/keyframe-store/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm bench        # the codec benchmark, writing the colocated *.bench.md
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/keyframe-store/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/keyframe-store/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/keyframe-store/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/keyframe-store.svg
