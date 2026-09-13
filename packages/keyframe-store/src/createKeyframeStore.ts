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
import { ObjectNotStoredError } from "#src/models/ObjectNotStoredError";
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
  // A keyframe's plaintext is the dictionary every delta anchored to it decodes against, so it is verified
  // Before anything encodes against it: a delta written against mismatched plaintext depends on the damage and
  // Stops decoding the moment the keyframe is repaired. A base that is itself a delta is not a state this store
  // Writes, and refusing it is what keeps reconstruction at two objects rather than a chain
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

    return { plaintext: verifyContentAddress(hash, await decodeObject(parsedObject)), storedBytes: bytes.byteLength };
  };
  // The full fetch-decode-verify a read already pays, reused by a dedup hit: a head read proves the stored
  // Object starts with a well-formed header, never that its payload survived — a torn write or one bit of rot
  // Can leave enough of the header intact to parse while the compressed frame behind it does not decode to
  // What it claims. Adopting on the header alone would report someone else's write as this one's success
  const readVerifiedObject = async (hash: string): Promise<{ baseHash: string; plaintext: Uint8Array }> => {
    const bytes = await objectStore.read(hash);
    if (!bytes) throw new ObjectNotStoredError(hash, "object is not stored");

    const parsedObject = parseObject(hash, bytes);
    if (!parsedObject.baseHash)
      return { baseHash: "", plaintext: verifyContentAddress(hash, await decodeObject(parsedObject)) };

    const keyframe = await readKeyframe(parsedObject.baseHash);
    if (!keyframe) throw new ObjectNotStoredError(hash, `keyframe ${parsedObject.baseHash} is not stored`);

    return {
      baseHash: parsedObject.baseHash,
      plaintext: verifyContentAddress(hash, await decodeObject(parsedObject, keyframe.plaintext)),
    };
  };
  // What a write reports when the store already holds the content: the stored object's own base, because that
  // Is the keyframe the caller's record must name for collection to keep alive — never the base this writer
  // Would have chosen, which is the wrong one whenever the object under the key was written against another
  const adoptStored = async (hash: string, plaintextBytes: number): Promise<WrittenVersion> => {
    const { baseHash } = await readVerifiedObject(hash);
    return { baseHash, hash, isDeduplicated: true, plaintextBytes, storedBytes: 0 };
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
    read: (hash) => getResultAsync(async () => (await readVerifiedObject(hash)).plaintext),
    write: (plaintext, anchor) =>
      getResultAsync(async () => {
        const hash = getContentAddress(plaintext);
        const plaintextBytes = plaintext.byteLength;
        // Write-once: content the store already holds is adopted rather than rewritten, and its own header says
        // Which keyframe it decodes against — the base the caller's record has to carry, or collection would
        // Free a keyframe this version still needs
        const storedHead = await objectStore.read(hash, DELTA_HEADER_BYTE_COUNT);
        if (storedHead) return adoptStored(hash, plaintextBytes);

        // One place lands an object, whichever kind it is. The head read above and the backend's own create-only
        // Condition are two checks with a gap between them, and a twin writing the same content can land in it —
        // Against a different anchor, since each writer chose its own. The loser then reports the twin's object,
        // Read back for its base, rather than the one it encoded: a record carrying this writer's base would name a
        // Keyframe the stored delta never decodes against, and a charge for its bytes would be for bytes it never
        // Stored
        const writeObject = async (bytes: Uint8Array, baseHash: string): Promise<WrittenVersion> => {
          const isCreated = await objectStore.write(hash, bytes);
          if (isCreated)
            return { baseHash, hash, isDeduplicated: false, plaintextBytes, storedBytes: bytes.byteLength };

          const twinHead = await objectStore.read(hash, DELTA_HEADER_BYTE_COUNT);
          if (!twinHead)
            throw new InvalidOperationError(Operation.Create, hash, "refused as already stored, but nothing is stored");

          return adoptStored(hash, plaintextBytes);
        };
        const keyframeBytes = await encodeObject(plaintext, compressionLevel);
        const writeKeyframe = () => writeObject(keyframeBytes, "");
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

        return writeObject(deltaBytes, anchor.hash);
      }),
  };
};
