import { InvalidOperationError, Operation } from "@esposter/shared";

const CSV_SEPARATOR_CODE_POINT = ",".codePointAt(0) ?? 0;
const ZERO_CODE_POINT = "0".codePointAt(0) ?? 0;
const NINE_CODE_POINT = "9".codePointAt(0) ?? 0;
const WHITESPACE_REGEX = /\s/u;

// A CSV layer writes one unsigned gid per cell, separated by commas, and reads the characters once, the way the
// Browser parses a number, so no cell is split out of the text first. A cell's whitespace is ignored at its edges, and
// Any other character, or a digit after a cell's own whitespace, is refused rather than read as a zero.
export const decodeCsv = (text: string): number[] => {
  const tiles: number[] = [];
  let tile = 0;
  let hasDigit = false;
  let isEnded = false;
  for (let index = 0; index <= text.length; index++) {
    // Past the last character there is no code point, which closes the last cell as a separator would
    const codePoint = text.codePointAt(index) ?? CSV_SEPARATOR_CODE_POINT;
    if (codePoint === CSV_SEPARATOR_CODE_POINT) {
      tiles.push(tile);
      tile = 0;
      hasDigit = false;
      isEnded = false;
    } else if (codePoint >= ZERO_CODE_POINT && codePoint <= NINE_CODE_POINT) {
      if (isEnded) throw new InvalidOperationError(Operation.Read, decodeCsv.name, "has a cell with two numbers");
      tile = tile * 10 + codePoint - ZERO_CODE_POINT;
      hasDigit = true;
    } else if (WHITESPACE_REGEX.test(text.charAt(index))) isEnded ||= hasDigit;
    else throw new InvalidOperationError(Operation.Read, decodeCsv.name, `${text.charAt(index)} is not a tile gid`);
  }
  return tiles;
};
