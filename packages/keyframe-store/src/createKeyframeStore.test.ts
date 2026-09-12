import type { KeyframeStore } from "#src/models/KeyframeStore";
import type { VersionAnchor } from "#src/models/VersionAnchor";
import type { WrittenVersion } from "#src/models/WrittenVersion";
import type { ResultAsync } from "neverthrow";

import { createKeyframeStore } from "#src/createKeyframeStore";
import { createDocumentVersions } from "#src/services/createDocumentVersions.test";
import { createMemoryObjectStore } from "#src/services/createMemoryObjectStore.test";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const unwrap = <T>(result: ResultAsync<T, Error>) =>
  result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
const countKeyframes = (writtenVersions: WrittenVersion[]) =>
  writtenVersions.filter(({ baseHash }) => !baseHash).length;

describe(createKeyframeStore, () => {
  const seed = 1;
  const rowCount = 1000;
  const versionCount = 20;
  const editCount = 30;
  const versions = createDocumentVersions({ editCount, rowCount, seed, versionCount });
  const baseVersion = takeOne(versions);
  const editedVersion = takeOne(versions, 1);
  const rewrittenVersion = takeOne(createDocumentVersions({ editCount, rowCount, seed: 2, versionCount: 1 }));
  const emptyAnchor: VersionAnchor = { anchoredBytes: 0, hash: "" };
  // Writes a session the way a caller does: the anchor is derived from what the previous write reported, and
  // Resets whenever a write comes back with an empty base
  const writeVersions = async (keyframeStore: KeyframeStore, sessionVersions: Uint8Array[]) => {
    let anchor = emptyAnchor;
    const writtenVersions: WrittenVersion[] = [];
    for (const version of sessionVersions) {
      const writtenVersion = await unwrap(keyframeStore.write(version, anchor));
      anchor = writtenVersion.baseHash
        ? { anchoredBytes: anchor.anchoredBytes + writtenVersion.storedBytes, hash: anchor.hash }
        : { anchoredBytes: 0, hash: writtenVersion.hash };
      writtenVersions.push(writtenVersion);
    }
    return writtenVersions;
  };

  test("round-trips a keyframe and the delta anchored to it to the exact input bytes", async () => {
    expect.hasAssertions();

    const keyframeStore = createKeyframeStore(createMemoryObjectStore());
    const [keyframe, delta] = await writeVersions(keyframeStore, [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);

    expect(keyframe.baseHash).toBe("");
    expect(delta.baseHash).toBe(keyframe.hash);
    // A delta costs the edit, not the document
    expect(delta.storedBytes).toBeLessThan(keyframe.storedBytes / 10);
    await expect(unwrap(keyframeStore.read(keyframe.hash))).resolves.toStrictEqual(baseVersion);
    await expect(unwrap(keyframeStore.read(delta.hash))).resolves.toStrictEqual(editedVersion);
  });

  // A version that repeats content the store already holds is free, in bytes and in charge — and it reports the
  // Base its object was written against, because that is what the caller's record has to carry for collection
  // To keep the keyframe alive
  test("adopts content it already holds instead of writing it again", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const keyframeStore = createKeyframeStore(memoryObjectStore);
    const [keyframe, delta] = await writeVersions(keyframeStore, [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);
    const rewrittenKeyframe = await unwrap(keyframeStore.write(baseVersion, emptyAnchor));
    const rewrittenDelta = await unwrap(keyframeStore.write(editedVersion, emptyAnchor));

    expect(rewrittenKeyframe).toStrictEqual({ ...keyframe, isDeduplicated: true, storedBytes: 0 });
    expect(rewrittenDelta).toStrictEqual({ ...delta, isDeduplicated: true, storedBytes: 0 });
    expect(memoryObjectStore.objects.size).toBe(2);
  });

  // A version whose difference from its anchor no longer compresses to meaningfully less than the version itself
  // Has drifted far enough that anchoring it buys little and costs a second read forever
  test("promotes a wholesale rewrite to a keyframe", async () => {
    expect.hasAssertions();

    const keyframeStore = createKeyframeStore(createMemoryObjectStore());
    const [keyframe, promotedKeyframe] = await writeVersions(keyframeStore, [baseVersion, rewrittenVersion]);
    assert.exists(keyframe);
    assert.exists(promotedKeyframe);

    expect(promotedKeyframe.baseHash).toBe("");
    expect(promotedKeyframe.hash).not.toBe(keyframe.hash);
  });

  // The ratio bounds one delta against its own standalone size, which says nothing about how many of them a
  // Segment holds: a run of small edits satisfies it indefinitely, so the storage bound is the budget's alone
  // To hold
  test("promotes once the bytes anchored to a keyframe reach the segment budget", async () => {
    expect.hasAssertions();

    const singleEditVersions = createDocumentVersions({ editCount: 1, rowCount, seed, versionCount });
    const unboundedVersions = await writeVersions(createKeyframeStore(createMemoryObjectStore()), singleEditVersions);
    const budgetedVersions = await writeVersions(
      createKeyframeStore(createMemoryObjectStore(), { segmentBudgetRatio: 0.01 }),
      singleEditVersions,
    );

    expect(countKeyframes(unboundedVersions)).toBe(1);
    expect(countKeyframes(budgetedVersions)).toBeGreaterThan(1);
  });

  // The one failure this format can suffer — a truncated, altered or misfiled object — surfaces as a refused
  // Read of one version rather than as a document that looks right and is not
  test("refuses an object that does not decode to its key", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const keyframeStore = createKeyframeStore(memoryObjectStore);
    const [keyframe, delta] = await writeVersions(keyframeStore, [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);
    const keyframeBytes = memoryObjectStore.objects.get(keyframe.hash);
    assert.exists(keyframeBytes);
    // A whole object filed under another version's key parses and decompresses cleanly, so only the hash
    // Check can catch it
    memoryObjectStore.objects.set(delta.hash, keyframeBytes);

    await expect(unwrap(keyframeStore.read(delta.hash))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, delta.hash, "object does not hash to its key").message}]`,
    );

    // The header stays intact, so the damage reaches the frame rather than the parser
    const alteredBytes = new Uint8Array(keyframeBytes);
    alteredBytes.fill(0xff, -1);
    memoryObjectStore.objects.set(keyframe.hash, alteredBytes);

    await expect(unwrap(keyframeStore.read(keyframe.hash))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Data corruption detected]`,
    );

    memoryObjectStore.objects.set(keyframe.hash, Buffer.from(""));

    await expect(unwrap(keyframeStore.read(keyframe.hash))).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, keyframe.hash, "not a keyframe store object").message}]`,
    );
  });

  // An object survives while any record names it, as its own hash or as its base — so a keyframe outlives its
  // Own record for as long as a delta still decodes against it
  test("collects only what no surviving record names", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const keyframeStore = createKeyframeStore(memoryObjectStore);
    const [keyframe, delta] = await writeVersions(keyframeStore, [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);

    await expect(unwrap(keyframeStore.collect([keyframe.hash], [delta.hash, keyframe.hash]))).resolves.toStrictEqual(
      [],
    );
    await expect(unwrap(keyframeStore.collect([keyframe.hash, delta.hash], []))).resolves.toStrictEqual([
      keyframe.hash,
      delta.hash,
    ]);
    expect(memoryObjectStore.objects.size).toBe(0);
  });

  // The value proposition itself, pinned: compression ratios are not speed, so the bench cannot gate them, and a
  // Regression that quietly turned every version into a keyframe would pass every test above
  test("stores a working session for a fraction of the bytes it holds", async () => {
    expect.hasAssertions();

    const writtenVersions = await writeVersions(createKeyframeStore(createMemoryObjectStore()), versions);
    const sumBytes = (readBytes: (writtenVersion: WrittenVersion) => number) =>
      writtenVersions.reduce((total, writtenVersion) => total + readBytes(writtenVersion), 0);

    expect(sumBytes(({ plaintextBytes }) => plaintextBytes)).toMatchInlineSnapshot(`1140624`);
    expect(sumBytes(({ storedBytes }) => storedBytes)).toMatchInlineSnapshot(`63503`);
  });
});
