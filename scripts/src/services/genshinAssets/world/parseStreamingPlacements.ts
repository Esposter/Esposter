import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { Vector } from "#src/models/shared/Vector";

const BLOB_LENGTH_BYTES = 4;
const VARINT_CONTINUATION_BIT = 0x80;
const VARINT_VALUE_BITS = 0x7f;
const VARINT_BITS_PER_BYTE = 7n;
const FLOAT_BYTES = 4;
// A chunk's mask: its id, then its records, a count and that many. A chunk with any other bit (the tile's volumes, its
// Trailer) is another structure, and is skipped whole
const CHUNK_ID_BIT = 1;
const CHUNK_RECORDS_BIT = 2;
const CHUNK_KNOWN_BITS = CHUNK_ID_BIT | CHUNK_RECORDS_BIT;
// A record's fields, each present where its bit of the record's leading mask is set and written in the bits' order;
// Bit 9 is a flag with no bytes. A mask with a bit past these ends its chunk, as no record of a placement carries one
/* eslint-disable perfectionist/sort-objects -- bit order is the format */
const RecordBit = {
  Flags: 1,
  PathHash: 1 << 1,
  PrefabId: 1 << 2,
  Radius: 1 << 3,
  Position: 1 << 4,
  Rotation: 1 << 5,
  Scale: 1 << 6,
  Instance: 1 << 7,
  Parent: 1 << 8,
} as const;
/* eslint-enable perfectionist/sort-objects */
const RECORD_MASK_LIMIT = 1 << 10;
// A vector's components each present where their bit of its own leading byte is set, x first
const VECTOR_AXES = [1, 2, 4] as const;
const VECTOR_MASK_LIMIT = 8;
// The open world's placements out of a StreamGen blob (`StreamGen/BigWorld_1_-2`, named by its path's hash), read
// Chunk by chunk from its start and at each offset its index gives (`parseStreamingIndex`), which names every chunk
// But the first. Every number is a varint of seven-bit groups
// Low first, every float four little-endian bytes, and every vector a byte of which components follow; an absent
// Position or rotation component is zero, an absent scale component one. A record carrying no position places nothing,
// And a malformed one ends its chunk
export const parseStreamingPlacements = (blob: Buffer, offsets: readonly number[]): WorldPlacement[] => {
  const placements: WorldPlacement[] = [];
  let cursor = 0;
  let end = 0;
  const readVarint = (): bigint => {
    let value = 0n;
    for (let shift = 0n; ; shift += VARINT_BITS_PER_BYTE) {
      if (cursor >= end) break;
      const byte = blob[cursor++] ?? 0;
      value |= BigInt(byte & VARINT_VALUE_BITS) << shift;
      if (!(byte & VARINT_CONTINUATION_BIT)) break;
    }
    return value;
  };
  // NaN where the float would run past its chunk, which ends the chunk as any malformed record does
  const readFloat = (): number => {
    if (cursor + FLOAT_BYTES > end) return Number.NaN;
    const value = blob.readFloatLE(cursor);
    cursor += FLOAT_BYTES;
    return value;
  };
  const readVector = (absent: number): undefined | Vector => {
    const mask = cursor < end ? (blob[cursor++] ?? VECTOR_MASK_LIMIT) : VECTOR_MASK_LIMIT;
    if (mask >= VECTOR_MASK_LIMIT) return undefined;
    const [x = absent, y = absent, z = absent] = VECTOR_AXES.map((axis) => (mask & axis ? readFloat() : absent));
    if ([x, y, z].some((component) => Number.isNaN(component))) return undefined;
    return [x, y, z];
  };
  // The blob's first chunk starts it, whether or not its index names it
  const starts = [...new Set([0, ...offsets])];
  for (const [index, start] of starts.entries()) {
    cursor = BLOB_LENGTH_BYTES + start;
    end = BLOB_LENGTH_BYTES + (starts[index + 1] ?? blob.length - BLOB_LENGTH_BYTES);
    const chunkMask = Number(readVarint());
    if (chunkMask & ~CHUNK_KNOWN_BITS || !(chunkMask & CHUNK_RECORDS_BIT)) continue;
    if (chunkMask & CHUNK_ID_BIT) readVarint();
    const count = Number(readVarint());
    for (let record = 0; record < count; record++) {
      // The cursor moves as each field is read, so a count past the chunk's end stops at it
      if (cursor >= end) break;
      const mask = Number(readVarint());
      if (mask >= RECORD_MASK_LIMIT) break;
      if (mask & RecordBit.Flags) readVarint();
      const pathHash = mask & RecordBit.PathHash ? String(readVarint()) : "";
      const prefabId = mask & RecordBit.PrefabId ? Number(readVarint()) : 0;
      const radius = mask & RecordBit.Radius ? readFloat() : 0;
      const position: undefined | Vector = mask & RecordBit.Position ? readVector(0) : [0, 0, 0];
      const rotation: undefined | Vector = mask & RecordBit.Rotation ? readVector(0) : [0, 0, 0];
      const scale: undefined | Vector = mask & RecordBit.Scale ? readVector(1) : [1, 1, 1];
      if (Number.isNaN(radius) || !position || !rotation || !scale) break;
      if (mask & RecordBit.Instance) readVarint();
      if (mask & RecordBit.Parent) readVarint();
      if (mask & RecordBit.Position) placements.push({ pathHash, position, prefabId, radius, rotation, scale });
    }
  }
  return placements;
};
