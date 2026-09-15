import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { getTriggerlessFindings } from "#src/services/sweeps/skillDocs/getTriggerlessFindings";
import { describe, expect, test } from "vitest";

describe(getTriggerlessFindings, () => {
  const path = ".agents/skills/a/references/a.md";
  const finding = {
    detail: 'its first paragraph does not open "Read …"',
    path,
    type: SkillDocsFindingType.Triggerless,
  };

  test("reports a page whose title is followed straight by a section heading", () => {
    expect.hasAssertions();

    expect(getTriggerlessFindings([{ path, text: "# A\n\n## B\n\na\n" }])).toStrictEqual([finding]);
  });

  test("reports nothing for a page opening on the canonical form", () => {
    expect.hasAssertions();

    expect(getTriggerlessFindings([{ path, text: "# A\n\nRead when a.\n\n## B\n" }])).toStrictEqual([]);
  });

  // These all name a trigger and all read differently, which is why the opening is one fixed form rather than a
  // Pattern trying to cover them: the corpus is normalised so the check decides instead of judging
  test.each(["Use it for a.", "For tests that a.", "Only with its workflow off: a.", "Anchored on a change."])(
    "reports an opening that names its trigger some other way: %s",
    (opening) => {
      expect.hasAssertions();

      expect(getTriggerlessFindings([{ path, text: `# A\n\n${opening}\n\n## B\n` }])).toStrictEqual([finding]);
    },
  );

  test("reports nothing for a file with no title", () => {
    expect.hasAssertions();

    expect(getTriggerlessFindings([{ path, text: "## B\n\na\n" }])).toStrictEqual([]);
  });
});
