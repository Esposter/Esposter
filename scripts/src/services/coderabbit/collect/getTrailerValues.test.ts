import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { describe, expect, test } from "vitest";

describe(getTrailerValues, () => {
  test("reads a comma list and a repeated key alike, trimmed", () => {
    expect.hasAssertions();

    expect(getTrailerValues(`${EXPRESS_TRAILER}: a, b\n${EXPRESS_TRAILER}:c\n`, EXPRESS_TRAILER)).toStrictEqual([
      "a",
      "b",
      "c",
    ]);
  });

  // Every commit ends with the attribution line, so a trailer a paragraph above it is one git's own trailer
  // Reader reports as absent
  test("reads a key separated from the last block by a blank line", () => {
    expect.hasAssertions();

    expect(getTrailerValues(`${EXPRESS_TRAILER}: a\n\nCo-Authored-By: b\n`, EXPRESS_TRAILER)).toStrictEqual(["a"]);
  });

  test("reads nothing off a key that only appears inside a sentence", () => {
    expect.hasAssertions();

    expect(getTrailerValues(`the ${EXPRESS_TRAILER}: lane\n`, EXPRESS_TRAILER)).toStrictEqual([]);
  });
});
