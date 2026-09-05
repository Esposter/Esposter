import { CTIX_TS_CONFIGURATION, NON_SOURCE_SUFFIXES, SOURCE_CONDITION } from "#src/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A tsconfig is JSON with no import mechanism, so it repeats the literal and this test is the only thing
 * holding the copy to the owner. Renaming the condition without it leaves the preset opted into a name nothing
 * exports any more: every tool resolves a sibling's `dist` instead of its source, silently and correctly, and
 * only a stale build ever shows it.
 */
describe("SOURCE_CONDITION", () => {
  test("is the condition the tsconfig preset opts into", () => {
    expect.hasAssertions();

    const tsconfigPath = resolve(import.meta.dirname, "../tsconfig.base.json");
    // eslint-disable-next-line no-restricted-syntax -- a tsconfig carries no dates, and this package builds before @esposter/shared so it cannot import jsonDateParse
    const { compilerOptions } = JSON.parse(readFileSync(tsconfigPath, "utf8")) as {
      compilerOptions: { customConditions: string[] };
    };

    expect(compilerOptions.customConditions).toStrictEqual([SOURCE_CONDITION]);
  });
});

/**
 * The same two configs the barrel is generated from, and neither can import the list it repeats: one is ctix's own
 * JSON and the other is the tsconfig it is pointed at. A suffix dropped from either is silent in both directions —
 * ctix would list a test file in the published barrel, and the build program would compile one into the
 * declarations — while every check in the repository still passes.
 */
describe("NON_SOURCE_SUFFIXES", () => {
  // A recursive suffix glob and nothing else. `${configDir}/*.config.ts` excludes one root-level file and
  // `${configDir}/scripts/**/*.ts` a whole directory, so neither is a claim about what a non-source file is, and
  // Matching them here would make this assert the rest of an exclude list it has no opinion on.
  const NON_SOURCE_GLOB_REGEX = /\*\*\/\*(?<suffix>\.[\w-]+\.ts)$/u;
  const readExcludedSuffixes = (fileName: string): string[] => {
    // eslint-disable-next-line no-restricted-syntax -- neither config carries dates, and this package builds before @esposter/shared so it cannot import jsonDateParse
    const { exclude } = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", fileName), "utf8")) as {
      exclude: string[];
    };

    return exclude
      .map((excluded) => NON_SOURCE_GLOB_REGEX.exec(excluded)?.groups?.suffix)
      .filter((suffix) => suffix !== undefined)
      .toSorted();
  };

  test.each([CTIX_TS_CONFIGURATION, "tsconfig.build.base.json"])("are the suffixes %s excludes", (fileName) => {
    expect.hasAssertions();

    expect(readExcludedSuffixes(fileName)).toStrictEqual(NON_SOURCE_SUFFIXES.toSorted());
  });
});
