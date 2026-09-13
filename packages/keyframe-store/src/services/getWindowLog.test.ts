import { MAX_WINDOW_LOG, MIN_WINDOW_LOG } from "#src/constants";
import { getWindowLog } from "#src/services/getWindowLog";
import { describe, expect, test } from "vitest";

describe(getWindowLog, () => {
  // The window has to span the dictionary and the input together, or the encoder cannot match across them
  test.each([
    { dictionaryByteCount: 0, expected: MIN_WINDOW_LOG, inputByteCount: 1 },
    { dictionaryByteCount: 300_000, expected: 20, inputByteCount: 300_000 },
    { dictionaryByteCount: 2 ** 30, expected: MAX_WINDOW_LOG, inputByteCount: 2 ** 30 },
  ])(
    "spans a $dictionaryByteCount byte dictionary and a $inputByteCount byte input with 2^$expected",
    ({ dictionaryByteCount, expected, inputByteCount }) => {
      expect.hasAssertions();
      expect(getWindowLog(dictionaryByteCount, inputByteCount)).toBe(expected);
    },
  );
});
