import type { AkpkEntry } from "#src/models/voiceMatch/AkpkEntry";

import { AKPK_EXTERNAL_ENTRY_BYTES, AKPK_EXTERNAL_ID_BYTES } from "#src/services/voiceMatch/constants";

const COUNT_BYTES = 4;
const UINT32_BYTES = 4;

// The externals table: a count, then one row per clip. The start block is in units of the row's own block size,
// And a row whose clip has no bytes is a stub the package lists but does not hold
export const parseAkpkExternals = (table: Buffer): AkpkEntry[] => {
  const count = table.readUInt32LE(0);
  const entries: AkpkEntry[] = [];
  for (let index = 0; index < count; index += 1) {
    const cursor = COUNT_BYTES + index * AKPK_EXTERNAL_ENTRY_BYTES;
    const id = table.readBigUInt64LE(cursor);
    const blockSize = table.readUInt32LE(cursor + AKPK_EXTERNAL_ID_BYTES);
    const size = table.readUInt32LE(cursor + AKPK_EXTERNAL_ID_BYTES + UINT32_BYTES);
    const offset = table.readUInt32LE(cursor + AKPK_EXTERNAL_ID_BYTES + UINT32_BYTES * 2) * blockSize;
    if (size > 0) entries.push({ id, offset, size });
  }

  return entries;
};
