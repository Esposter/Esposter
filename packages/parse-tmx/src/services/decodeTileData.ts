import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";

import { Compression } from "#src/models/Compression";
import { Encoding } from "#src/models/Encoding";
import { getDecompressedBytes } from "#src/services/getDecompressedBytes";
import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { exhaustiveGuard, InvalidOperationError, normalizeString, Operation } from "@esposter/shared";

const CSV_SEPARATOR_CHAR_CODE = ",".charCodeAt(0);
const ZERO_CHAR_CODE = "0".charCodeAt(0);
const NINE_CHAR_CODE = "9".charCodeAt(0);
const WHITESPACE_REGEX = /\s/u;

// A CSV layer writes one unsigned gid per cell, separated by commas, and reads the characters once, the way the
// Browser parses a number, so no cell is split out of the text first. A cell's whitespace is ignored at its edges, and
// Any other character, or a digit after a cell's own whitespace, is refused rather than read as a zero.
const decodeCsv = (text: string): number[] => {
  const tiles: number[] = [];
  let tile = 0;
  let hasDigit = false;
  let isEnded = false;
  for (let index = 0; index <= text.length; index++) {
    const charCode = text.charCodeAt(index);
    if (index === text.length || charCode === CSV_SEPARATOR_CHAR_CODE) {
      tiles.push(tile);
      tile = 0;
      hasDigit = false;
      isEnded = false;
    } else if (charCode >= ZERO_CHAR_CODE && charCode <= NINE_CHAR_CODE) {
      if (isEnded) throw new InvalidOperationError(Operation.Read, decodeCsv.name, "has a cell with two numbers");
      tile = tile * 10 + charCode - ZERO_CHAR_CODE;
      hasDigit = true;
    } else if (WHITESPACE_REGEX.test(text.charAt(index))) isEnded ||= hasDigit;
    else throw new InvalidOperationError(Operation.Read, decodeCsv.name, `${text.charAt(index)} is not a tile gid`);
  }
  return tiles;
};

// Every form the cells are written in decodes to one gid per cell
export const decodeTileData = async (source: TMXDataSource): Promise<number[]> => {
  const { compression, encoding, gids, text } = source;
  // The form Tiled deprecated, one `<tile>` element per cell, has no encoding and is read as the gids it already holds
  if (encoding === undefined) return gids;

  const data = normalizeString(text);
  switch (encoding) {
    case Encoding.Base64: {
      const bytes = Uint8Array.fromBase64(data);
      switch (compression) {
        case Compression.Gzip:
        case Compression.Zlib:
          return unpackTileBytes(await getDecompressedBytes(bytes, compression));
        case undefined:
          return unpackTileBytes(bytes);
        default:
          return exhaustiveGuard(compression);
      }
    }
    case Encoding.Csv:
      return decodeCsv(data);
    default:
      return exhaustiveGuard(encoding);
  }
};
