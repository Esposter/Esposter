import { NON_SOURCE_SUFFIXES, SOURCE_CONDITION } from "#src/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A tsconfig is JSON with no import mechanism, so it repeats the literal and this test is the only thing
 * holding the copy to the owner. Renaming the condition without it leaves the preset opted into a name nothing
 * exports any more: every tool resolves a sibling's `dist` instead of its source, silently and correctly, and
 * only a stale build ever shows it.
 */
describe("sourceCondition", () => {
  test("is the condition the tsconfig preset opts into", () => {
    expect.hasAssertions();

    const tsconfigPath = resolve(import.meta.dirname, "../tsconfig.base.json");
    // oxlint-disable-next-line no-restricted-properties -- a tsconfig carries no dates, and this package builds before @esposter/shared so it cannot import jsonDateParse
    const { compilerOptions } = JSON.parse(readFileSync(tsconfigPath, "utf8")) as {
      compilerOptions: { customConditions: string[] };
    };

    expect(compilerOptions.customConditions).toStrictEqual([SOURCE_CONDITION]);
  });
});

/**
 * The build program's excludes are JSON with no import mechanism, so they repeat the list the barrel generator
 * reads. A suffix dropped from the copy is silent: the build program compiles a test into the declarations while
 * every check in the repository still passes.
 */
describe("nonSourceSuffixes", () => {
  // A recursive suffix glob and nothing else. `${configDir}/*.config.ts` excludes one root-level file and
  // `${configDir}/scripts/**/*.ts` a whole directory, so neither is a claim about what a non-source file is, and
  // Matching them here would make this assert the rest of an exclude list it has no opinion on.
  const NON_SOURCE_GLOB_REGEX = /\*\*\/\*(?<suffix>\.[\w-]+\.ts)$/u;

  test("are the suffixes the build program excludes", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line no-restricted-properties -- the tsconfig carries no dates, and this package builds before @esposter/shared so it cannot import jsonDateParse
    const { exclude } = JSON.parse(
      readFileSync(resolve(import.meta.dirname, "../tsconfig.build.base.json"), "utf8"),
    ) as { exclude: string[] };

    expect(
      exclude
        .map((excluded) => NON_SOURCE_GLOB_REGEX.exec(excluded)?.groups?.suffix)
        .filter((suffix) => suffix !== undefined)
        .toSorted(),
    ).toStrictEqual(NON_SOURCE_SUFFIXES.toSorted());
  });
});
