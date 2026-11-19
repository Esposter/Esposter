import { parsePublicKey } from "#server/services/storage/parsePublicKey";
import { describe, expect, test } from "vitest";

describe(parsePublicKey, () => {
  test.each([
    ["a/b", "a/b"],
    ["tex/%E9%9D%A2.png", "tex/面.png"],
    ["%25C68Z", "%C68Z"],
    ["%5B%5D", "[]"],
  ])("%s is read as %s", (encodedKey, key) => {
    expect.hasAssertions();

    expect(parsePublicKey(encodedKey)).toStrictEqual(key);
  });

  test("a malformed escape is no key", () => {
    expect.hasAssertions();

    expect(parsePublicKey("%E0")).toBeUndefined();
  });

  test("a separator escaped into a segment is no key", () => {
    expect.hasAssertions();

    expect(parsePublicKey("a%2Fb")).toBeUndefined();
  });
});
