import { getUtf8ByteLength } from "#src/util/text/getUtf8ByteLength";
import { describe, expect, test } from "vitest";

describe(getUtf8ByteLength, () => {
  test("counts each character by the bytes UTF-8 writes it in", () => {
    expect.hasAssertions();

    expect(getUtf8ByteLength("")).toBe(0);
    expect(getUtf8ByteLength("a")).toBe(1);
    expect(getUtf8ByteLength("é")).toBe(2);
    expect(getUtf8ByteLength("中")).toBe(3);
    expect(getUtf8ByteLength("😀")).toBe(4);
  });

  test("counts a text longer than its scratch whole, a surrogate pair straddling the parts included", () => {
    expect.hasAssertions();

    const pairCount = 2 ** 15;

    expect(getUtf8ByteLength(`a${"😀".repeat(pairCount)}`)).toBe(1 + 4 * pairCount);
  });
});
