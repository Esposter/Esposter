import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";
import { mergeModuleOptions } from "#src/services/mergeModuleOptions";
import { assert, describe, expect, test } from "vitest";

describe(mergeModuleOptions, () => {
  const DEFAULTS = getDefaultModuleOptions(false, "http://localhost:3000", false);

  test("a consumer's sources are appended to the default directive, and false removes a directive", () => {
    expect.hasAssertions();

    const { headers } = mergeModuleOptions(DEFAULTS, {
      headers: {
        ...getDefaultSecurityHeaders(false, false),
        contentSecurityPolicy: { "img-src": false, "script-src": ["'unsafe-eval'"] },
      },
    });
    const { contentSecurityPolicy: defaultPolicy } = getDefaultSecurityHeaders(false, false);
    if (!headers || !headers.contentSecurityPolicy || !defaultPolicy) assert.fail("the policy is disabled");
    const defaultScriptSources = Array.isArray(defaultPolicy["script-src"]) ? defaultPolicy["script-src"] : [];

    expect(headers.contentSecurityPolicy["script-src"]).toStrictEqual([...defaultScriptSources, "'unsafe-eval'"]);
    expect(headers.contentSecurityPolicy).not.toHaveProperty("img-src");
  });

  test("a source added beside a default 'none' replaces it, since 'none' only stands alone", () => {
    expect.hasAssertions();

    const { headers } = mergeModuleOptions(DEFAULTS, {
      headers: {
        ...getDefaultSecurityHeaders(false, false),
        contentSecurityPolicy: { "script-src-attr": ["'unsafe-hashes'", "'sha256-hash'"] },
      },
    });
    if (!headers || !headers.contentSecurityPolicy) assert.fail("the policy is disabled");

    expect(headers.contentSecurityPolicy["script-src-attr"]).toStrictEqual(["'unsafe-hashes'", "'sha256-hash'"]);
  });

  test("a consumer's own 'none' replaces the default sources", () => {
    expect.hasAssertions();

    const { headers } = mergeModuleOptions(DEFAULTS, {
      headers: { ...getDefaultSecurityHeaders(false, false), contentSecurityPolicy: { "font-src": ["'none'"] } },
    });
    if (!headers || !headers.contentSecurityPolicy) assert.fail("the policy is disabled");

    expect(headers.contentSecurityPolicy["font-src"]).toStrictEqual(["'none'"]);
  });

  test("an option the consumer leaves out keeps its default", () => {
    expect.hasAssertions();

    expect(mergeModuleOptions(DEFAULTS, {}).headers).toStrictEqual(DEFAULTS.headers);
  });
});
