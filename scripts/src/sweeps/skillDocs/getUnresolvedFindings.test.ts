import { getUnresolvedFindings } from "#scripts/sweeps/skillDocs/getUnresolvedFindings";
import { SkillDocsFindingType } from "#scripts/sweeps/skillDocs/models/SkillDocsFindingType";
import { describe, expect, test } from "vitest";

describe(getUnresolvedFindings, () => {
  const path = ".agents/skills/a/SKILL.md";
  const target = ".agents/skills/a/references/a.md";

  test("reports a citation resolving to no file", () => {
    expect.hasAssertions();

    expect(getUnresolvedFindings([{ path, text: "`references/a.md`" }], new Set([path]))).toStrictEqual([
      { detail: "-> a.md", path, type: SkillDocsFindingType.Unresolved },
    ]);
  });

  test("reports nothing for a citation that resolves", () => {
    expect.hasAssertions();

    expect(getUnresolvedFindings([{ path, text: "`references/a.md`" }], new Set([path, target]))).toStrictEqual([]);
  });

  // Every cross-skill pointer would report otherwise, and a check that always reports gates nothing
  test("reports nothing when the named skill holds the cited page", () => {
    expect.hasAssertions();

    expect(
      getUnresolvedFindings(
        [
          { path, text: "the `b` skill's `references/a.md`" },
          { path: ".agents/skills/b/SKILL.md", text: "" },
        ],
        new Set([".agents/skills/b/references/a.md", path]),
      ),
    ).toStrictEqual([]);
  });

  test("still reports a cross-skill citation the named skill does not hold", () => {
    expect.hasAssertions();

    expect(
      getUnresolvedFindings(
        [
          { path, text: "the `b` skill's `references/a.md`" },
          { path: ".agents/skills/b/SKILL.md", text: "" },
        ],
        new Set([path]),
      ),
    ).toStrictEqual([{ detail: "-> a.md", path, type: SkillDocsFindingType.Unresolved }]);
  });

  test("still reports a line naming its own skill", () => {
    expect.hasAssertions();

    expect(getUnresolvedFindings([{ path, text: "the `a` skill's `references/a.md`" }], new Set([path]))).toHaveLength(
      1,
    );
  });
});
