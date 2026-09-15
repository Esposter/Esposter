import { substituteBlueprintParameterTokens } from "@@/server/services/blueprint/substituteBlueprintParameterTokens";
import { describe, expect, test } from "vitest";

describe(substituteBlueprintParameterTokens, () => {
  const parameterValues = new Map([["a", "b"]]);

  test("substitutes a declared parameter", () => {
    expect.hasAssertions();

    expect(substituteBlueprintParameterTokens("{{parameter:a}} ", parameterValues)).toBe("b ");
  });

  test("leaves a token naming an undeclared parameter as its literal text", () => {
    expect.hasAssertions();

    expect(substituteBlueprintParameterTokens("{{parameter:-1}}", parameterValues)).toBe("{{parameter:-1}}");
  });

  // The lookup is keyed by the manifest author, so a key naming an inherited object member has to resolve
  // Like any other undeclared key rather than substituting a stringified builtin into the deployed content
  test.each(["constructor", "toString", "__proto__"])("leaves %s as its literal token", (key) => {
    expect.hasAssertions();

    expect(substituteBlueprintParameterTokens(`{{parameter:${key}}}`, parameterValues)).toBe(`{{parameter:${key}}}`);
  });
});
