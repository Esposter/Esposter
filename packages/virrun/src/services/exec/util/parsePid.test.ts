import { PID } from "@/services/exec/test/constants.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { parsePid } from "@/services/exec/util/parsePid";
import { describe, expect, test } from "vitest";

describe(parsePid, () => {
  test(`reads the leading pid from a temp owner segment`, () => {
    expect.hasAssertions();

    expect(parsePid(`${PID}.${TEST_FILENAME}`)).toBe(PID);
  });

  test(`reads a bare pid lease name`, () => {
    expect.hasAssertions();

    expect(parsePid(String(PID))).toBe(PID);
  });

  test(`returns undefined for a non-integer name`, () => {
    expect.hasAssertions();

    expect(parsePid(TEST_FILENAME)).toBeUndefined();
  });
});
