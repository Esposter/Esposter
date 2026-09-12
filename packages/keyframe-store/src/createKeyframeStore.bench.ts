import type { VersionAnchor } from "#src/models/VersionAnchor";
import type { ResultAsync } from "neverthrow";

import { createKeyframeStore } from "#src/createKeyframeStore";
import { createDocumentVersions } from "#src/services/createDocumentVersions.test";
import { createMemoryObjectStore } from "#src/services/createMemoryObjectStore.test";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { randomBytes } from "node:crypto";
import { describe, test } from "vitest";

// Roughly 60 KB, 600 KB and 6 MB of tabular JSON — the shape the store exists for, at the sizes a document here
// Actually reaches
const BENCH_ROW_COUNTS = [1000, 10000, 100000];
const SEED = 1;
const EMPTY_ANCHOR: VersionAnchor = { anchoredBytes: 0, hash: "" };
const COPY_KEY = "copy";
const unwrap = <T>(result: ResultAsync<T, Error>) =>
  result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
// One group per document size, so every task in it shares the scale and `vs base` isolates the shape of the
// Edit — a single cell, half the cells, a rewrite, and bytes that cannot be compressed or differenced at all,
// Which is the honest worst case — against writing the plaintext straight to the backend, exactly what a
// Version costs without the store
describe(createKeyframeStore, () => {
  test.for(BENCH_ROW_COUNTS)("%i rows", async (rowCount, { bench }) => {
    const [baseVersion, singleEditVersion] = createDocumentVersions({
      editCount: 1,
      rowCount,
      seed: SEED,
      versionCount: 2,
    });
    const [, broadEditVersion] = createDocumentVersions({
      editCount: rowCount / 2,
      rowCount,
      seed: SEED,
      versionCount: 2,
    });
    const [rewrittenVersion] = createDocumentVersions({ editCount: 0, rowCount, seed: SEED + 1, versionCount: 1 });
    if (!baseVersion || !singleEditVersion || !broadEditVersion || !rewrittenVersion) return;

    const incompressibleVersion = randomBytes(baseVersion.byteLength);
    // Seeded once with the keyframe every write task encodes against, then copied into a fresh backend per
    // Iteration so a write never deduplicates against what its own previous iteration stored
    const seededObjectStore = createMemoryObjectStore();
    const seededKeyframeStore = createKeyframeStore(seededObjectStore);
    const keyframe = await unwrap(seededKeyframeStore.write(baseVersion, EMPTY_ANCHOR));
    const anchor: VersionAnchor = { anchoredBytes: 0, hash: keyframe.hash };
    // Copied before the delta lands, so the write tasks encode against the keyframe alone and never find the
    // Single-cell edit already stored
    const keyframeObjects = new Map(seededObjectStore.objects);
    const delta = await unwrap(seededKeyframeStore.write(singleEditVersion, anchor));
    const createSeededKeyframeStore = () => createKeyframeStore(createMemoryObjectStore(new Map(keyframeObjects)));
    const copyObjectStore = createMemoryObjectStore();
    await copyObjectStore.write(COPY_KEY, singleEditVersion);
    await bench.compare(
      bench("native — a full copy written to the backend", () =>
        createMemoryObjectStore().write(COPY_KEY, singleEditVersion)),
      bench("write — content already held", () => unwrap(createSeededKeyframeStore().write(baseVersion, EMPTY_ANCHOR))),
      bench("write — a single-cell edit, as a delta", () =>
        unwrap(createSeededKeyframeStore().write(singleEditVersion, anchor))),
      bench("write — a broad edit, as a delta", () =>
        unwrap(createSeededKeyframeStore().write(broadEditVersion, anchor))),
      bench("write — a wholesale rewrite, promoting", () =>
        unwrap(createSeededKeyframeStore().write(rewrittenVersion, anchor))),
      bench("write — an incompressible payload, promoting", () =>
        unwrap(createSeededKeyframeStore().write(incompressibleVersion, anchor))),
      bench("read — a full copy from the backend", () => copyObjectStore.read(COPY_KEY)),
      bench("read — a keyframe", () => unwrap(seededKeyframeStore.read(keyframe.hash))),
      bench("read — a delta", () => unwrap(seededKeyframeStore.read(delta.hash))),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
