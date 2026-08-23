import { encodeUrlSubDelimiters } from "#src/util/text/encodeUrlSubDelimiters";
import { describe, expect, test } from "vitest";

describe(encodeUrlSubDelimiters, () => {
  const prefix = "https://account.blob.core.windows.net/c/1/";

  test("should return a url without sub-delimiters unchanged", () => {
    expect.hasAssertions();

    expect(encodeUrlSubDelimiters(`${prefix}a?sig=a%2Fb`)).toBe(`${prefix}a?sig=a%2Fb`);
  });

  test("should encode the sub-delimiters Azure leaves literal in the blob path", () => {
    expect.hasAssertions();

    expect(encodeUrlSubDelimiters(`${prefix}a(1)!'*`)).toBe(`${prefix}a%281%29%21%27%2A`);
  });

  test("should encode the sub-delimiters a download SAS carries in its rscd query", () => {
    expect.hasAssertions();

    expect(encodeUrlSubDelimiters(`${prefix}a?rscd=filename%3D%22a(1)%22`)).toBe(
      `${prefix}a?rscd=filename%3D%22a%281%29%22`,
    );
  });
});
