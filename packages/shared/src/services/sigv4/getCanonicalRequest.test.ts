import { getCanonicalRequest } from "#src/services/sigv4/getCanonicalRequest";
import { describe, expect, test } from "vitest";

describe(getCanonicalRequest, () => {
  const payloadHash = "UNSIGNED-PAYLOAD";

  test("keeps a literal plus in an S3 path as a plus, which S3 never reads as a space", () => {
    expect.hasAssertions();

    const { canonicalRequest } = getCanonicalRequest(
      "GET",
      new URL("https://a.example.com/a+b.txt"),
      new Headers(),
      payloadHash,
    );

    expect(canonicalRequest.split("\n")[1]).toBe("/a%2Bb.txt");
  });

  test("keeps every pair of a repeated query name, sorted by value", () => {
    expect.hasAssertions();

    const { canonicalQuery } = getCanonicalRequest(
      "GET",
      new URL("https://a.example.com/?b=2&b=1&a="),
      new Headers(),
      payloadHash,
    );

    expect(canonicalQuery).toBe("a=&b=1&b=2");
  });
});
