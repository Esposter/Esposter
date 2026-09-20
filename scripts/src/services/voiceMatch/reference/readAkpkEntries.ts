import type { AkpkEntry } from "#src/models/voiceMatch/AkpkEntry";

import { AKPK_HEADER_BYTES, AKPK_MAGIC } from "#src/services/voiceMatch/constants";
import { parseAkpkExternals } from "#src/services/voiceMatch/reference/parseAkpkExternals";
import { readFileRange } from "#src/services/voiceMatch/reference/readFileRange";
import { InvalidOperationError, Operation } from "@esposter/shared";

const MAGIC_BYTES = 4;
// After the magic, the header size and the version: the language map, the banks, the streams and the externals
const LANGUAGE_MAP_SIZE_OFFSET = 12;
const BANKS_SIZE_OFFSET = 16;
const STREAMS_SIZE_OFFSET = 20;
const EXTERNALS_SIZE_OFFSET = 24;

// The clips a package holds, read from its header and its externals table alone — a package is tens to hundreds of
// Megabytes and the two tables are kilobytes, so the file is never read whole
export const readAkpkEntries = (path: string): AkpkEntry[] => {
  const header = readFileRange(path, 0, AKPK_HEADER_BYTES);
  const magic = header.toString("ascii", 0, MAGIC_BYTES);
  if (magic !== AKPK_MAGIC) throw new InvalidOperationError(Operation.Read, readAkpkEntries.name, path);

  const externalsOffset =
    AKPK_HEADER_BYTES +
    header.readUInt32LE(LANGUAGE_MAP_SIZE_OFFSET) +
    header.readUInt32LE(BANKS_SIZE_OFFSET) +
    header.readUInt32LE(STREAMS_SIZE_OFFSET);
  const externals = readFileRange(path, externalsOffset, header.readUInt32LE(EXTERNALS_SIZE_OFFSET));
  return parseAkpkExternals(externals);
};
