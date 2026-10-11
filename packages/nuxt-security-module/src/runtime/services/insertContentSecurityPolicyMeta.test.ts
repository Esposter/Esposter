import { describe, expect, test } from "vitest";

import { insertContentSecurityPolicyMeta } from "#src/runtime/services/insertContentSecurityPolicyMeta";

describe(insertContentSecurityPolicyMeta, () => {
  const POLICY = { "default-src": ["'self'"] };
  const META = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\';">';

  test("#444 the meta element goes after the charset declaration, which must come first in the head", () => {
    expect.hasAssertions();

    expect(insertContentSecurityPolicyMeta('<head><meta charset="utf-8"><title>x</title></head>', POLICY)).toBe(
      `<head><meta charset="utf-8">${META}<title>x</title></head>`,
    );
  });

  test("#329 frame-ancestors is left out of the meta element, where a browser ignores it", () => {
    expect.hasAssertions();

    expect(insertContentSecurityPolicyMeta("<head></head>", { ...POLICY, "frame-ancestors": ["'self'"] })).toBe(
      `<head>${META}</head>`,
    );
  });

  test("#178 a head that is only its elements takes the meta element at its start", () => {
    expect.hasAssertions();

    expect(insertContentSecurityPolicyMeta("<title>x</title>", POLICY)).toBe(`${META}<title>x</title>`);
  });

  test("a policy meta element already in the head is replaced, not duplicated", () => {
    expect.hasAssertions();

    expect(
      insertContentSecurityPolicyMeta('<head><meta http-equiv="Content-Security-Policy" content="old"></head>', POLICY),
    ).toBe(`<head>${META}</head>`);
  });
});
