import type { KeyframeStore } from "#src/models/KeyframeStore";
import type { KeyframeStoreOptions } from "#src/models/KeyframeStoreOptions";
import type { ObjectStore } from "#src/models/ObjectStore";
import type { WrittenVersion } from "#src/models/WrittenVersion";

import {
  DEFAULT_COMPRESSION_LEVEL,
  DEFAULT_PROMOTION_RATIO,
  DEFAULT_SEGMENT_BUDGET_RATIO,
  DELTA_HEADER_BYTE_COUNT,
} from "#src/constants";
import { decodeObject } from "#src/services/decodeObject";
import { encodeObject } from "#src/services/encodeObject";
import { getContentAddress } from "#src/services/getContentAddress";
import { parseObject } from "#src/services/parseObject";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Cheap, because the hash is already computed on every write, and it turns the one failure this format can
// Suffer — a truncated or mismatched object — into a refused read rather than a plausible-looking document
const verifyContentAddress = (hash: string, plaintext: Uint8Array): Uint8Array => {
  if (getContentAddress(plaintext) !== hash)
    throw new InvalidOperationError(Operation.Read, hash, "object does not hash to its key");

  return plaintext;
};
// The store: immutable objects addressed by the hash of their plaintext, each either a keyframe compressed
// On its own or a delta compressed against exactly one keyframe. No chains, no generations, no rewriting —
// Reconstructing any version is at most two reads, and an object once written is never touched again until
// It is collected. The store takes bytes and returns bytes: it never parses and never sees a schema, which
// Puts one obligation on the caller — the same content must serialize to the same bytes, or the address
// Moves and deduplication silently stops
export const createKeyframeStore = (
  objectStore: ObjectStore,
  {
    compressionLevel = DEFAULT_COMPRESSION_LEVEL,
    promotionRatio = DEFAULT_PROMOTION_RATIO,
    segmentBudgetRatio = DEFAULT_SEGMENT_BUDGET_RATIO,
  }: KeyframeStoreOptions = {},
): KeyframeStore => {
  // A keyframe's plaintext is the dictionary every delta anchored to it decodes against. A base that is
  // Itself a delta is not a state this store writes, and refusing it is what keeps reconstruction at two
  // Objects rather than a chain
  const readKeyframe = async (hash: string): Promise<undefined | { plaintext: Uint8Array; storedBytes: number }> => {
    const bytes = await objectStore.read(hash);
    if (!bytes) return undefined;

    const parsedObject = parseObject(hash, bytes);
    if (parsedObject.baseHash)
      throw new InvalidOperationError(
        Operation.Read,
        hash,
        `is a delta against ${parsedObject.baseHash}, not a keyframe`,
      );

    return { plaintext: await decodeObject(parsedObject), storedBytes: bytes.byteLength };
  };
  return {
    // An object survives while any record names it, as its own hash or as its base — the caller answers that
    // From its records, so collection is never an object read
    collect: (releasedHashes, retainedHashes) =>
      getResultAsync(async () => {
        const retainedHashSet = new Set(retainedHashes);
        const collectableHashes = [...new Set(releasedHashes)].filter((hash) => !retainedHashSet.has(hash));
        if (collectableHashes.length > 0) await objectStore.delete(collectableHashes);
        return collectableHashes;
      }),
    read: (hash) =>
      getResultAsync(async () => {
        const bytes = await objectStore.read(hash);
        if (!bytes) throw new InvalidOperationError(Operation.Read, hash, "object is not stored");

        const parsedObject = parseObject(hash, bytes);
        if (!parsedObject.baseHash) return verifyContentAddress(hash, await decodeObject(parsedObject));

        const keyframe = await readKeyframe(parsedObject.baseHash);
        if (!keyframe)
          throw new InvalidOperationError(Operation.Read, hash, `keyframe ${parsedObject.baseHash} is not stored`);

        return verifyContentAddress(hash, await decodeObject(parsedObject, keyframe.plaintext));
      }),
    write: (plaintext, anchor) =>
      getResultAsync(async () => {
        const hash = getContentAddress(plaintext);
        const plaintextBytes = plaintext.byteLength;
        // Write-once: content the store already holds is adopted rather than rewritten, and its own header says
        // Which keyframe it decodes against — the base the caller's record has to carry, or collection would
        // Free a keyframe this version still needs
        const storedHead = await objectStore.read(hash, DELTA_HEADER_BYTE_COUNT);
        if (storedHead)
          return {
            baseHash: parseObject(hash, storedHead).baseHash,
            hash,
            isDeduplicated: true,
            plaintextBytes,
            storedBytes: 0,
          };

        const keyframeBytes = await encodeObject(plaintext, compressionLevel);
        const writeKeyframe = async (): Promise<WrittenVersion> => {
          await objectStore.write(hash, keyframeBytes);
          return { baseHash: "", hash, isDeduplicated: false, plaintextBytes, storedBytes: keyframeBytes.byteLength };
        };
        if (!anchor.hash) return writeKeyframe();
        // An anchor the store no longer holds cannot be encoded against, so the lineage starts over from this
        // Version — the record it writes is honest about that, and nothing downstream depends on the gap
        const keyframe = await readKeyframe(anchor.hash);
        if (!keyframe) return writeKeyframe();

        const deltaBytes = await encodeObject(plaintext, compressionLevel, {
          hash: anchor.hash,
          plaintext: keyframe.plaintext,
        });
        // The ratio bounds one delta's drift from its anchor; the budget bounds what a segment accumulates.
        // Either failing promotes, which restores the margin for everything after it — so a document edited in
        // Small steps keeps one anchor for a long run, one rewritten wholesale promotes immediately, and a long
        // Run of cheap edits still cannot grow a segment past its budget
        const isWithinPromotionRatio = deltaBytes.byteLength <= keyframeBytes.byteLength * promotionRatio;
        const isWithinSegmentBudget =
          anchor.anchoredBytes + deltaBytes.byteLength <= keyframe.storedBytes * segmentBudgetRatio;
        if (!isWithinPromotionRatio || !isWithinSegmentBudget) return writeKeyframe();

        await objectStore.write(hash, deltaBytes);
        return {
          baseHash: anchor.hash,
          hash,
          isDeduplicated: false,
          plaintextBytes,
          storedBytes: deltaBytes.byteLength,
        };
      }),
  };
};
