import { mergeSecurityRules } from "#src/runtime/services/mergeSecurityRules";
import { describe, expect, test } from "vitest";

describe(mergeSecurityRules, () => {
  test("the first rules to set a key win, so the most specific route keeps its value", () => {
    expect.hasAssertions();

    expect(
      mergeSecurityRules(
        { corsHandler: { methods: ["GET"], origin: "https://a.example" } },
        { corsHandler: { methods: ["POST", "PUT"], origin: "https://b.example" } },
      ),
    ).toStrictEqual({ corsHandler: { methods: ["GET"], origin: "https://a.example" } });
  });

  test("a key only a less specific route sets is taken from it", () => {
    expect.hasAssertions();

    expect(mergeSecurityRules({ nonce: false }, { hidePoweredBy: true })).toStrictEqual({
      hidePoweredBy: true,
      nonce: false,
    });
  });
});
