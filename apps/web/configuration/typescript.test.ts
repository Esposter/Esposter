// oxlint-disable no-restricted-imports -- a suite runs under Vitest, never in `nuxt prepare`
import { typescript } from "#configuration/typescript";
import { SOURCE_CONDITION } from "@esposter/configuration";
import { describe, expect, test } from "vitest";

describe("typescript", () => {
  // The tsconfigs spell the condition rather than import it, since the config loads before
  // `@esposter/configuration` is built — so this is what holds the spelling to the one the packages export under
  test("resolves every generated tsconfig through the source condition", () => {
    expect.hasAssertions();

    expect(typescript?.tsConfig?.compilerOptions?.customConditions).toStrictEqual([SOURCE_CONDITION]);
  });

  // The packages get these from `tsconfig.base.json`, which no generated tsconfig extends: `erasableSyntaxOnly` is what
  // Refuses an enum, so a value set stays an object Node's type stripping can load
  test.each(["erasableSyntaxOnly", "exactOptionalPropertyTypes", "noUnusedLocals"] as const)(
    "keeps %s on in the generated tsconfig, which the app typechecks against",
    (compilerOption) => {
      expect.hasAssertions();

      expect(typescript?.tsConfig?.compilerOptions?.[compilerOption]).toBe(true);
    },
  );
});
