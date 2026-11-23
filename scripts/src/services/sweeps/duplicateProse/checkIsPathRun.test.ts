import { checkIsPathRun } from "#src/services/sweeps/duplicateProse/checkIsPathRun";
import { getPathShingles } from "#src/services/sweeps/duplicateProse/getPathShingles";
import { getProseWords } from "#src/services/sweeps/duplicateProse/getProseWords";
import { describe, expect, test } from "vitest";

describe(checkIsPathRun, () => {
  const pathShingles = getPathShingles([getProseWords("apps/web/server/services/resource/takeRevision.ts").join(" ")]);
  const NO_LINK_TARGETS = new Set<string>();
  const LINK_TARGET_WORDS = getProseWords("specs/kit/design.md#how-a-kit-is-read");
  const linkTargets = new Set([LINK_TARGET_WORDS.join(" ")]);
  const prose = getProseWords(
    "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty",
  );

  test("reads a path with the words that label it as a citation", () => {
    expect.hasAssertions();

    expect(
      checkIsPathRun(
        getProseWords("apps/web/server/services/resource/takeRevision.ts the revision take"),
        pathShingles,
        NO_LINK_TARGETS,
      ),
    ).toBe(true);
  });

  test("reads a run whose prose alone is a run as a copy, whatever path it cites", () => {
    expect.hasAssertions();

    expect(
      checkIsPathRun([...getProseWords("services/resource/takeRevision.ts"), ...prose], pathShingles, NO_LINK_TARGETS),
    ).toBe(false);
  });

  test("reads two words of a path as prose", () => {
    expect.hasAssertions();

    expect(
      checkIsPathRun([...getProseWords("services/resource"), ...prose.slice(0, 18)], pathShingles, NO_LINK_TARGETS),
    ).toBe(false);
  });

  test("reads three words of a link target that a run does not hold whole as prose", () => {
    expect.hasAssertions();

    expect(checkIsPathRun([...getProseWords("a kit is"), ...prose.slice(0, 18)], pathShingles, linkTargets)).toBe(
      false,
    );
  });

  test("reads a link target a run holds whole, with the words that label it, as a citation", () => {
    expect.hasAssertions();

    expect(checkIsPathRun([...LINK_TARGET_WORDS, ...prose.slice(0, 13)], pathShingles, linkTargets)).toBe(true);
  });

  test("reports a copy that links an anchor when twenty words of prose remain", () => {
    expect.hasAssertions();

    expect(checkIsPathRun([...prose, ...LINK_TARGET_WORDS], pathShingles, linkTargets)).toBe(false);
  });
});
