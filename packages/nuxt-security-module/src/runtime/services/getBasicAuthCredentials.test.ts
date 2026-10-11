import { getBasicAuthCredentials } from "#src/runtime/services/getBasicAuthCredentials";
import * as fc from "fast-check";
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

  test("a value that is not valid base64 is refused rather than thrown", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials("Basic !!!")).toBeUndefined();
  });

  test("padding short of a whole quantum is refused rather than thrown, so a malformed header answers 401", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials("Basic QQ=")).toBeUndefined();
    expect(getBasicAuthCredentials("Basic QUJDRA=")).toBeUndefined();
  });

  test("an unpadded value decodes as its padded form does", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials(`Basic ${btoa("user:pa").replace(/=+$/u, "")}`)).toStrictEqual({
      name: "user",
      pass: "pa",
    });
  });

  test("no header value throws, so a client cannot turn a malformed one into a 500", () => {
    expect.hasAssertions();

    // Base64-shaped values with any padding reach the decoder, which is the step that can throw
    const headerValue = fc.oneof(fc.string(), fc.stringMatching(/^[d+/A-Za-z]{0,12}={0,3}$/u));
    fc.assert(
      fc.property(headerValue, (value) => {
        expect(() => getBasicAuthCredentials(`Basic ${value}`)).not.toThrow();
      }),
    );
  });

  test("another scheme is refused", () => {
    expect.hasAssertions();

    expect(getBasicAuthCredentials("Bearer token")).toBeUndefined();
  });
});
