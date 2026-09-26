import type { KeyframeStore } from "#src/models/KeyframeStore";
import type { KeyframeStoreOptions } from "#src/models/KeyframeStoreOptions";
import type { ObjectStore } from "#src/models/ObjectStore";
import type { ParsedObject } from "#src/models/ParsedObject";
import type { WrittenVersion } from "#src/models/WrittenVersion";

import { DEFAULT_PROMOTION_RATIO, DEFAULT_SEGMENT_BUDGET_RATIO } from "#src/constants";
import { ObjectNotStoredError } from "#src/models/ObjectNotStoredError";
import { decodeObject } from "#src/services/decodeObject";
import { encodeObject } from "#src/services/encodeObject";
import { getContentAddress } from "#src/services/getContentAddress";
import { parseObject } from "#src/services/parseObject";
import { DEFAULT_COMPRESSION_LEVEL, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// The only decode this store makes, so no read path can hand back plaintext its key was never checked against.
// Cheap, because the hash is already computed on every write, and it turns the one failure this format can
// Suffer — a truncated or mismatched object — into a refused read rather than a plausible-looking document
const decodeVerifiedObject = async (
  hash: string,
  parsedObject: ParsedObject,
  basePlaintext?: Uint8Array,
): Promise<Uint8Array> => {
  const plaintext = await decodeObject(parsedObject, basePlaintext);
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

    return { plaintext: await decodeVerifiedObject(hash, parsedObject), storedBytes: bytes.byteLength };
  };
  // The one read every path takes, undefined when nothing is stored under the key. A read, a dedup hit and a
  // Lost create-only write all fetch, decode and hash-verify the whole object: a head read would prove the stored
  // Object starts with a well-formed header, never that its payload survived — a torn write or one bit of rot
  // Can leave enough of the header intact to parse while the compressed frame behind it does not decode to
  // What it claims. Adopting on the header alone would report someone else's write as this one's success
  const readStoredObject = async (hash: string): Promise<undefined | { baseHash: string; plaintext: Uint8Array }> => {
    const bytes = await objectStore.read(hash);
    if (!bytes) return undefined;

    const parsedObject = parseObject(hash, bytes);
    if (!parsedObject.baseHash) return { baseHash: "", plaintext: await decodeVerifiedObject(hash, parsedObject) };

    const keyframe = await readKeyframe(parsedObject.baseHash);
    if (!keyframe) throw new ObjectNotStoredError(hash, `keyframe ${parsedObject.baseHash} is not stored`);

    return {
      baseHash: parsedObject.baseHash,
      plaintext: await decodeVerifiedObject(hash, parsedObject, keyframe.plaintext),
    };
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
        const storedObject = await readStoredObject(hash);
        if (!storedObject) throw new ObjectNotStoredError(hash, "object is not stored");

        return storedObject.plaintext;
      }),
    write: (plaintext, anchor) =>
      getResultAsync(async () => {
        const hash = getContentAddress(plaintext);
        const plaintextBytes = plaintext.byteLength;
        // What a write reports when the store already holds the content: the stored object's own base, because
        // That is the keyframe the caller's record must name for collection to keep alive — never the base this
        // Writer would have chosen, which is the wrong one whenever the object under the key was written against
        // Another
        const adoptStored = (baseHash: string): WrittenVersion => ({
          baseHash,
          hash,
          isDeduplicated: true,
          plaintextBytes,
          storedBytes: 0,
        });
        // Write-once: content the store already holds is adopted rather than rewritten, and its own header says
        // Which keyframe it decodes against — the base the caller's record has to carry, or collection would
        // Free a keyframe this version still needs
        const storedObject = await readStoredObject(hash);
        if (storedObject) return adoptStored(storedObject.baseHash);
        // One place lands an object, whichever kind it is. The read above and the backend's own create-only
        // Condition are two checks with a gap between them, and a twin writing the same content can land in it —
        // Against a different anchor, since each writer chose its own. The loser then reports the twin's object,
        // Read back for its base, rather than the one it encoded: a record carrying this writer's base would name a
        // Keyframe the stored delta never decodes against, and a charge for its bytes would be for bytes it never
        // Stored
        const writeObject = async (bytes: Uint8Array, baseHash: string): Promise<WrittenVersion> => {
          const isCreated = await objectStore.write(hash, bytes);
          if (isCreated)
            return { baseHash, hash, isDeduplicated: false, plaintextBytes, storedBytes: bytes.byteLength };

          const twinObject = await readStoredObject(hash);
          if (!twinObject)
            throw new InvalidOperationError(Operation.Create, hash, "refused as already stored, but nothing is stored");

          return adoptStored(twinObject.baseHash);
        };
        // An anchor the store no longer holds cannot be encoded against, so the lineage starts over from this
        // Version — the record it writes is honest about that, and nothing downstream depends on the gap
        const encodeDelta = async (): Promise<undefined | { bytes: Uint8Array; keyframeStoredBytes: number }> => {
          const keyframe = await readKeyframe(anchor.hash);
          if (!keyframe) return undefined;

          const bytes = await encodeObject(plaintext, compressionLevel, {
            hash: anchor.hash,
            plaintext: keyframe.plaintext,
          });
          return { bytes, keyframeStoredBytes: keyframe.storedBytes };
        };
        // Standalone always, and against the anchor when the lineage has one: the ratio compares the two, so both
        // Are needed before either is chosen. Each compresses on its own threadpool thread, so the keyframe read
        // And the delta overlap the standalone encode, which dominates, rather than queueing behind it
        const keyframeEncoding = encodeObject(plaintext, compressionLevel);
        const deltaEncoding = anchor.hash ? encodeDelta() : undefined;
        const [keyframeBytes, delta] = await Promise.all([keyframeEncoding, deltaEncoding]);
        if (!delta) return writeObject(keyframeBytes, "");
        // The ratio bounds one delta's drift from its anchor; the budget bounds what a segment accumulates.
        // Either failing promotes, which restores the margin for everything after it — so a document edited in
        // Small steps keeps one anchor for a long run, one rewritten wholesale promotes immediately, and a long
        // Run of cheap edits still cannot grow a segment past its budget
        const isWithinPromotionRatio = delta.bytes.byteLength <= keyframeBytes.byteLength * promotionRatio;
        const isWithinSegmentBudget =
          anchor.anchoredBytes + delta.bytes.byteLength <= delta.keyframeStoredBytes * segmentBudgetRatio;
        if (!isWithinPromotionRatio || !isWithinSegmentBudget) return writeObject(keyframeBytes, "");
        else return writeObject(delta.bytes, anchor.hash);
      }),
  };
};
