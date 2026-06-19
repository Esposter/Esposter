import { getOutdatedDependents } from "@/checkDependencies/getOutdatedDependents";
import { describe, expect, test } from "vitest";

describe(getOutdatedDependents, () => {
  test("returns an empty array for a non-array value", () => {
    expect.hasAssertions();

    expect(getOutdatedDependents("")).toStrictEqual([]);
  });

  test("collects names and skips malformed entries", () => {
    expect.hasAssertions();

    expect(getOutdatedDependents([null, { name: "" }])).toStrictEqual([""]);
  });
});
