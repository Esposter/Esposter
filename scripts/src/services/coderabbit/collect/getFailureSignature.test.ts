import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { describe, expect, test } from "vitest";

describe(getFailureSignature, () => {
  // A run lists its jobs in whatever order they ran, and a matrix repeats one name: neither is a different red
  test("reads the same jobs in any order and repeated as one signature", () => {
    expect.hasAssertions();

    expect(getFailureSignature("", ["a", " ", "a"])).toStrictEqual(getFailureSignature("", [" ", "a"]));
  });

  test("tells a different workflow's same jobs apart", () => {
    expect.hasAssertions();

    expect(getFailureSignature("", ["a"]).hash).not.toBe(getFailureSignature(" ", ["a"]).hash);
  });
});
