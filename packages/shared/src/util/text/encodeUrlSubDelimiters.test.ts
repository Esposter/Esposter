import { encodeUrlSubDelimiters } from "#src/util/text/encodeUrlSubDelimiters";
import { describe, expect, test } from "vitest";

describe(encodeUrlSubDelimiters, () => {
  test("leaves a value already percent-encoded unchanged", () => {
    expect.hasAssertions();

    expect(encodeUrlSubDelimiters("%")).toBe("%");
  });

  test("encodes every sub-delimiter encodeURIComponent leaves literal", () => {
    expect.hasAssertions();

    expect(encodeUrlSubDelimiters("!'()*")).toBe("%21%27%28%29%2A");
  });
});
