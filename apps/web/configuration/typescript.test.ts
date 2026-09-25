import { nitro } from "@@/configuration/nitro";
import { typescript } from "@@/configuration/typescript";

// oxlint-disable-next-line no-restricted-imports -- a suite runs under Vitest, never in `nuxt prepare`
import { SOURCE_CONDITION } from "@esposter/configuration";
import { describe, expect, test } from "vitest";

describe("typescript", () => {
  // The Nuxt and Nitro tsconfigs spell the condition rather than import it, since the config loads before
  // `@esposter/configuration` is built — so this is what holds each spelling to the one the packages export under
  test("resolves every generated tsconfig through the source condition", () => {
    expect.hasAssertions();

    expect(
      [typescript?.nodeTsConfig, typescript?.sharedTsConfig, typescript?.tsConfig, nitro.typescript?.tsConfig].map(
        (tsConfig) => tsConfig?.compilerOptions?.customConditions,
      ),
    ).toStrictEqual([[SOURCE_CONDITION], [SOURCE_CONDITION], [SOURCE_CONDITION], [SOURCE_CONDITION]]);
  });
});
