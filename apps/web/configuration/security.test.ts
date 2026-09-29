import { MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { FilterXSS } from "xss";

// Nuxt-security's XSS validator rejects a request whose serialized body its `FilterXSS` would change, with the options
// Its middleware builds: `escapeHtml` left to the default, or replaced by the identity when configured off. This is
// The measurement `xssValidator: false` in `configuration/security.ts` rests on
describe("xssValidator", () => {
  const checkIsRejected = (filterXSS: FilterXSS, value: string) =>
    filterXSS.process(JSON.stringify({ value })) !== JSON.stringify({ value });

  test.each([
    ["a heart", "i <3 you"],
    ["a comparison", "a < b"],
    ["a password", "<"],
    ["a mention", `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}"></span>`],
  ])("rejects %s under its default options", (_, value) => {
    expect.hasAssertions();

    expect(checkIsRejected(new FilterXSS(), value)).toBe(true);
  });

  test("passes a script with escapeHtml off", () => {
    expect.hasAssertions();

    expect(checkIsRejected(new FilterXSS({ escapeHtml: (html) => html }), "<script></script>")).toBe(false);
  });
});
