import { parsePid } from "@/services/exec/util/parsePid";
import { describe, expect, test } from "vitest";

describe(parsePid, () => {
  const PID = 1234;
  // Stands in for the tail after the pid; irrelevant to the parse.
  const MKDTEMP_SUFFIX = "test";

  test(`reads the leading pid from a temp owner segment`, () => {
    expect.hasAssertions();

    expect(parsePid(`${PID}.${MKDTEMP_SUFFIX}`)).toBe(PID);
  });

  test(`reads a bare pid lease name`, () => {
    expect.hasAssertions();

    expect(parsePid(String(PID))).toBe(PID);
  });

  test(`returns undefined for a non-integer name`, () => {
    expect.hasAssertions();

    expect(parsePid(MKDTEMP_SUFFIX)).toBeUndefined();
  });
});
