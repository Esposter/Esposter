import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getPathShingles } from "#src/services/sweeps/duplicateProse/getPathShingles";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { describe, expect, test } from "vitest";

describe(checkIsPathRun, () => {
  const pathShingles = getPathShingles([getProseWords("apps/web/server/services/resource/takeRevision.ts").join(" ")]);
  const prose = getProseWords("one two three four five six seven eight nine ten");

  test("reads a path with the words that label it as a citation", () => {
    expect.hasAssertions();

    expect(
      checkIsPathRun(
        getProseWords("apps/web/server/services/resource/takeRevision.ts the revision take"),
        pathShingles,
      ),
    ).toBe(true);
  });

  test("reads a run whose prose alone is a run as a copy, whatever path it cites", () => {
    expect.hasAssertions();

    expect(checkIsPathRun([...getProseWords("services/resource/takeRevision.ts"), ...prose], pathShingles)).toBe(false);
  });

  test("reads two words of a path as prose", () => {
    expect.hasAssertions();

    expect(checkIsPathRun([...getProseWords("services/resource"), ...prose.slice(0, 8)], pathShingles)).toBe(false);
  });
});
