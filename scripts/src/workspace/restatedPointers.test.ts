import { readCitingPages } from "#src/services/citations/readCitingPages";
import { getRestatedPointerFindings } from "#src/services/sweeps/duplicateProse/getRestatedPointerFindings";
import { describe, expect, test } from "vitest";

/**
 * `ai:sweep:duplicate-prose` reports every run of words two pages of different owners share, and a run is a
 * candidate rather than a defect: which page owns a rule is a judgement, and two writers reaching for one phrase
 * is not a copy. A `Settled` line and a catalogue row are the subset where that judgement is already made — the
 * line names a direction and points at the one owner that argues it — so a run either shares with a page its own
 * pointer does not name is the argument stated twice, which is the drift `skill-authoring`'s
 * `references/settled-lists.md` refuses. That is what this decides and the sweep leaves to a reading pass.
 */
describe("restatedPointers", () => {
  test("every settled line and catalogue row shares a run only with the page it points at", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings(readCitingPages()).map(
        ({ line, otherPath, path }) => `${path} → ${otherPath}: ${line}`,
      ),
    ).toStrictEqual([]);
  });
});
