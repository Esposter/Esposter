import { describe, expect, test } from "vitest";

import { NONCE_PLACEHOLDER } from "#src/runtime/constants";
import { updateContentSecurityPolicy } from "#src/runtime/services/updateContentSecurityPolicy";

describe(updateContentSecurityPolicy, () => {
  const EMPTY_HASHES = { script: [], style: [] };

  test("#407 #413 the placeholder becomes this request's nonce in every directive that names it", () => {
    expect.hasAssertions();

    expect(
      updateContentSecurityPolicy(
        { "script-src": ["'self'", NONCE_PLACEHOLDER], "style-src": [NONCE_PLACEHOLDER] },
        { hashes: EMPTY_HASHES, nonce: "abc" },
      ),
    ).toStrictEqual({ "script-src": ["'self'", "'nonce-abc'"], "style-src": ["'nonce-abc'"] });
  });

  test("#602 without a nonce the placeholder is dropped rather than sent as its literal text", () => {
    expect.hasAssertions();

    expect(
      updateContentSecurityPolicy({ "script-src": ["'self'", NONCE_PLACEHOLDER] }, { hashes: EMPTY_HASHES }),
    ).toStrictEqual({ "script-src": ["'self'"] });
  });

  test("a static nonce written in the configuration is dropped in favour of the request's own", () => {
    expect.hasAssertions();

    expect(
      updateContentSecurityPolicy(
        { "script-src": ["'nonce-static'", NONCE_PLACEHOLDER] },
        { hashes: EMPTY_HASHES, nonce: "abc" },
      ),
    ).toStrictEqual({ "script-src": ["'nonce-abc'"] });
  });

  test("the prerender's hashes are appended to the script and style directives they belong to", () => {
    expect.hasAssertions();

    expect(
      updateContentSecurityPolicy(
        { "default-src": ["'self'"], "script-src": ["'self'"], "style-src": ["'self'"] },
        { hashes: { script: ["'sha256-s'"], style: ["'sha256-t'"] } },
      ),
    ).toStrictEqual({
      "default-src": ["'self'"],
      "script-src": ["'self'", "'sha256-s'"],
      "style-src": ["'self'", "'sha256-t'"],
    });
  });
});
