import { getBasicAuthCredentials } from "#src/runtime/services/getBasicAuthCredentials";
import { describe, expect, test } from "vitest";

describe(getBasicAuthCredentials, () => {
  test("a Basic header decodes to its name and password", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials(`Basic ${btoa("user:pass")}`)).toStrictEqual({ name: "user", pass: "pass" });
  });

  test("the name ends at the first colon, so a password may hold colons", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials(`Basic ${btoa("user:pa:ss")}`)).toStrictEqual({ name: "user", pass: "pa:ss" });
  });

  test("the credentials are UTF-8, so a non-ASCII password decodes to the characters the client encoded", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials(`Basic ${Buffer.from("user:pässwörd").toString("base64")}`)).toStrictEqual({
      name: "user",
      pass: "pässwörd",
    });
  });

  test.each(["", "!!!", "A", "AA=", "QUJDRA=", "=AAA", "AA===", "AAAA", "/w==", "💩"])(
    "a Base64 value that cannot encode credentials (%s) is refused rather than thrown",
    (value) => {
      expect.hasAssertions();

      expect(getBasicAuthCredentials(`Basic ${value}`)).toBeUndefined();
    },
  );

  test("an unpadded value decodes as its padded form does", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials(`Basic ${btoa("user:pa").replace(/=+$/u, "")}`)).toStrictEqual({
      name: "user",
      pass: "pa",
    });
  });

  test("another scheme is refused", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials("Bearer token")).toBeUndefined();
  });
});
