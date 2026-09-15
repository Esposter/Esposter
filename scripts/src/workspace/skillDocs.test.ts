import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { readSkillDocsFindings } from "#src/services/sweeps/skillDocs/readSkillDocsFindings";
import { describe, expect, test } from "vitest";

/**
 * The skill tree's structural checks, failed by the build rather than waited on by a sitting: nothing loads a
 * skill and reports a reference page its index never names, a description the listing truncates before its
 * trigger, or a `references/` pointer resolving nowhere, so a sweep was the only thing that ever saw them. The
 * budget is the one check kept out: a skill with no narrow trigger left to move stays over by design (the
 * `skill-authoring` skill, "SKILL.md is the always-on layer"), so it is a to-do the sweep reports, not a failure.
 */
describe("skillDocs", () => {
  test("every skill page passes every check but the budget", () => {
    expect.hasAssertions();

    expect(
      readSkillDocsFindings()
        .filter(({ type }) => type !== SkillDocsFindingType.Budget)
        .map(({ detail, path, type }) => `${type} ${path}: ${detail}`),
    ).toStrictEqual([]);
  });
});
