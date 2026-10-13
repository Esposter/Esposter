import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import { describe, expect, test } from "vitest";

describe(checkIsWatching, () => {
  const OWN_PROCESS_ID = 1;
  const OTHER_PROCESS_ID = process.ppid;

  test("is not watching when no claim exists", () => {
    expect.hasAssertions();

    expect(checkIsWatching(undefined, OWN_PROCESS_ID)).toBe(false);
  });

  test("is not watching when the claim is the process's own", () => {
    expect.hasAssertions();

    expect(checkIsWatching(OWN_PROCESS_ID, OWN_PROCESS_ID)).toBe(false);
  });

  test("is watching when another live process holds the claim", () => {
    expect.hasAssertions();

    expect(checkIsWatching(OTHER_PROCESS_ID, OWN_PROCESS_ID)).toBe(true);
  });

  test("is not watching once the claim's process is gone", () => {
    expect.hasAssertions();

    expect(checkIsWatching(2 ** 30, OWN_PROCESS_ID)).toBe(false);
  });
});
