import { parseProcStatStartTicks } from "#src/services/exec/util/parseProcStatStartTicks";
import { describe, expect, test } from "vitest";

describe(parseProcStatStartTicks, () => {
  // Field 3 is the state and 4 to 21 are filler, numbered by their position; 22 is the start time
  const fieldsBeforeStartTime = "S 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21";

  test("reads the 22nd field", () => {
    expect.hasAssertions();

    expect(parseProcStatStartTicks(`4242 (node) ${fieldsBeforeStartTime} 123456 0 0`)).toBe(123456);
  });

  // A comm holding a space and a `)` shifts every field for a split of the whole line
  test("counts from the last closing parenthesis, not the first", () => {
    expect.hasAssertions();

    expect(parseProcStatStartTicks(`4242 (my (odd) name) ${fieldsBeforeStartTime} 123456 0 0`)).toBe(123456);
  });
});
