import type { KeyframeStore } from "#src/models/KeyframeStore";
import type { ObjectStore } from "#src/models/ObjectStore";
import type { VersionAnchor } from "#src/models/VersionAnchor";
import type { WrittenVersion } from "#src/models/WrittenVersion";

import { OBJECT_FLAGS_OFFSET } from "#src/constants";
import { createKeyframeStore } from "#src/createKeyframeStore";
import { ObjectNotStoredError } from "#src/models/ObjectNotStoredError";
import { createDocumentVersions } from "#src/services/createDocumentVersions.test";
import { createMemoryObjectStore } from "#src/services/createMemoryObjectStore.test";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

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
      const writtenVersion = await keyframeStore.write(version, anchor).match(
        (value) => value,
        (error) => {
          throw error;
        },
      );
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
    await expect(
      keyframeStore.read(keyframe.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).resolves.toStrictEqual(baseVersion);
    await expect(
      keyframeStore.read(delta.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).resolves.toStrictEqual(editedVersion);
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
    const rewrittenKeyframe = await keyframeStore.write(baseVersion, emptyAnchor).match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
    const rewrittenDelta = await keyframeStore.write(editedVersion, emptyAnchor).match(
      (value) => value,
      (error) => {
        throw error;
      },
    );

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

    await expect(
      keyframeStore.read(delta.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, delta.hash, "object does not hash to its key").message}]`,
    );

    // The header stays intact, so the damage reaches the frame rather than the parser
    const alteredBytes = new Uint8Array(keyframeBytes);
    alteredBytes.fill(0xff, -1);
    memoryObjectStore.objects.set(keyframe.hash, alteredBytes);

    await expect(
      keyframeStore.read(keyframe.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Data corruption detected]`);

    // A flag nobody defined is refused, never read as a keyframe with its payload cut at the wrong offset
    const strangerFlagBytes = new Uint8Array(keyframeBytes);
    strangerFlagBytes[OBJECT_FLAGS_OFFSET] = 2;
    memoryObjectStore.objects.set(keyframe.hash, strangerFlagBytes);

    await expect(
      keyframeStore.read(keyframe.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, keyframe.hash, "unknown object flags 2").message}]`,
    );

    memoryObjectStore.objects.set(keyframe.hash, Buffer.from(""));

    await expect(
      keyframeStore.read(keyframe.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, keyframe.hash, "not a keyframe store object").message}]`,
    );
  });

  // A keyframe is the dictionary every delta anchored to it encodes against, so one that does not hash to its key
  // Is refused before anything is written against it: a delta encoded over the damage would depend on it, and
  // Stop decoding the moment the keyframe was repaired
  test("refuses to encode against a keyframe that does not hash to its key", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const keyframeStore = createKeyframeStore(memoryObjectStore);
    const [keyframe] = await writeVersions(keyframeStore, [baseVersion]);
    assert.exists(keyframe);
    // Another document's keyframe filed under the anchor's key decompresses cleanly, so only the hash check can
    // Catch it
    const strangerObjectStore = createMemoryObjectStore();
    const [strangerKeyframe] = await writeVersions(createKeyframeStore(strangerObjectStore), [rewrittenVersion]);
    assert.exists(strangerKeyframe);
    const strangerBytes = strangerObjectStore.objects.get(strangerKeyframe.hash);
    assert.exists(strangerBytes);
    memoryObjectStore.objects.set(keyframe.hash, strangerBytes);

    await expect(
      keyframeStore.write(editedVersion, { anchoredBytes: 0, hash: keyframe.hash }).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, keyframe.hash, "object does not hash to its key").message}]`,
    );
    expect(memoryObjectStore.objects.size).toBe(1);
  });

  // Two writers of one content both pass the head read, and each encodes against its own anchor. The one the
  // Backend refuses reports the object that stands under the key — the twin's, with the twin's base — because a
  // Record carrying this writer's base would name a keyframe the stored delta never decodes against, and a
  // Charge for its bytes would be for bytes it never stored
  test("reports the twin's object when its write lands second", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const [keyframe, delta] = await writeVersions(createKeyframeStore(memoryObjectStore), [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);
    const keyframeBytes = memoryObjectStore.objects.get(keyframe.hash);
    const deltaBytes = memoryObjectStore.objects.get(delta.hash);
    assert.exists(keyframeBytes);
    assert.exists(deltaBytes);
    // The twin lands between this writer's head read and its own write, as a delta against the keyframe, while
    // This writer — anchored to nothing — encoded a standalone keyframe the backend then refuses
    const racedObjects = new Map([[keyframe.hash, keyframeBytes]]);
    const racedObjectStore: ObjectStore = {
      ...createMemoryObjectStore(racedObjects),
      write: (key) => {
        racedObjects.set(key, deltaBytes);
        return Promise.resolve(false);
      },
    };

    await expect(
      createKeyframeStore(racedObjectStore)
        .write(editedVersion, emptyAnchor)
        .match(
          (value) => value,
          (error) => {
            throw error;
          },
        ),
    ).resolves.toStrictEqual({ ...delta, isDeduplicated: true, storedBytes: 0 });
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

    await expect(
      keyframeStore.collect([keyframe.hash], [delta.hash, keyframe.hash]).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).resolves.toStrictEqual([]);
    await expect(
      keyframeStore.collect([keyframe.hash, delta.hash], []).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).resolves.toStrictEqual([keyframe.hash, delta.hash]);
    expect(memoryObjectStore.objects.size).toBe(0);
  });

  // Absence and corruption are both read failures and mean opposite things to a caller: a record naming
  // Collected objects is a version that is simply gone, which a caller may answer with a 404, while an object
  // That no longer hashes to its key is damage nothing downstream should paper over. The type is what separates
  // Them, so it is asserted rather than the wording — a delta losing its base is absence just as much as one
  // Losing itself, because neither can be reconstructed and neither is evidence of damage
  test("reports a collected version as absent rather than as corruption", async () => {
    expect.hasAssertions();

    const memoryObjectStore = createMemoryObjectStore();
    const keyframeStore = createKeyframeStore(memoryObjectStore);
    const [keyframe, delta] = await writeVersions(keyframeStore, [baseVersion, editedVersion]);
    assert.exists(keyframe);
    assert.exists(delta);
    memoryObjectStore.objects.delete(keyframe.hash);

    await expect(
      keyframeStore.read(delta.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrow(ObjectNotStoredError);

    memoryObjectStore.objects.delete(delta.hash);

    await expect(
      keyframeStore.read(delta.hash).match(
        (value) => value,
        (error) => {
          throw error;
        },
      ),
    ).rejects.toThrow(ObjectNotStoredError);
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
