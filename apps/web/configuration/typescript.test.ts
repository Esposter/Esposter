// oxlint-disable no-restricted-imports -- a suite runs under Vitest, never in `nuxt prepare`
import { typescript } from "@@/configuration/typescript";
import { SOURCE_CONDITION } from "@esposter/configuration";
import { describe, expect, test } from "vitest";

describe("typescript", () => {
  // The tsconfigs spell the condition rather than import it, since the config loads before
  // `@esposter/configuration` is built — so this is what holds the spelling to the one the packages export under
  test("resolves every generated tsconfig through the source condition", () => {
    expect.hasAssertions();

    expect(typescript?.tsConfig?.compilerOptions?.customConditions).toStrictEqual([SOURCE_CONDITION]);
  });
});
