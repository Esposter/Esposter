import { typescript } from "#configuration/typescript";
import { SOURCE_CONDITION } from "@esposter/configuration/constants";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
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

  // The Vue packages read their template checks from `tsconfig.vue.json`, which no generated tsconfig extends either,
  // So the app restates them and may add to them, but never drops or changes one
  test("checks templates as strictly as the Vue packages do", async () => {
    expect.hasAssertions();

    const configurationPath = dirname(createRequire(import.meta.url).resolve("@esposter/configuration/package.json"));
    // oxlint-disable-next-line no-restricted-properties -- a tsconfig holds no dates to revive
    const { vueCompilerOptions } = JSON.parse(await readFile(join(configurationPath, "tsconfig.vue.json"), "utf8")) as {
      vueCompilerOptions: Record<string, unknown>;
    };

    const appOptions: Record<string, unknown> = typescript?.tsConfig?.vueCompilerOptions ?? {};

    expect(Object.fromEntries(Object.keys(vueCompilerOptions).map((key) => [key, appOptions[key]]))).toStrictEqual(
      vueCompilerOptions,
    );
  });
});
