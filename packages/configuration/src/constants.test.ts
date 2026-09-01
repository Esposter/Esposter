import { SOURCE_CONDITION } from "#src/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A tsconfig is JSON with no import mechanism, so it repeats the literal and this test is the only thing
 * holding the copy to the owner. Renaming the condition without it leaves the preset opted into a name nothing
 * exports any more: every tool resolves a sibling's `dist` instead of its source, silently and correctly, and
 * only a stale build ever shows it.
 */
describe(SOURCE_CONDITION, () => {
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
