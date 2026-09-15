import { SkillDocsFindingType } from "#src/models/sweeps/skillDocs/SkillDocsFindingType";
import { DESCRIPTION_OPENING, MAX_DESCRIPTION_CHARACTERS } from "#src/services/sweeps/skillDocs/constants";
import { getDescriptionFindings } from "#src/services/sweeps/skillDocs/getDescriptionFindings";
import { describe, expect, test } from "vitest";

describe(getDescriptionFindings, () => {
  const path = "path";
  const getSkill = (description: string) => ({ path, text: `---\ndescription: ${description}\n---\n` });
  const openingFinding = {
    detail: 'its description does not open "Apply when …"',
    path,
    type: SkillDocsFindingType.DescriptionOpening,
  };

  test("reports a description whose trigger is not its opening", () => {
    expect.hasAssertions();

    expect(getDescriptionFindings([getSkill(`a ${DESCRIPTION_OPENING}`)])).toStrictEqual([openingFinding]);
  });

  test("reports a description past the listing's cap", () => {
    expect.hasAssertions();

    const description = `${DESCRIPTION_OPENING}${"a".repeat(MAX_DESCRIPTION_CHARACTERS)}`;

    expect(getDescriptionFindings([getSkill(description)])).toStrictEqual([
      { detail: `${description.length} characters`, path, type: SkillDocsFindingType.DescriptionCap },
    ]);
  });

  test("reports a skill with no description as one that names no trigger", () => {
    expect.hasAssertions();

    expect(getDescriptionFindings([{ path, text: "---\n\n---\n" }])).toStrictEqual([openingFinding]);
  });

  // The body's frontmatter template is prose, so a skill that only shows the key there has no description
  test("reads the description from the leading frontmatter only", () => {
    expect.hasAssertions();

    const text = `---\n\n---\n\n\`\`\`\n---\ndescription: ${DESCRIPTION_OPENING}a\n---\n\`\`\`\n`;

    expect(getDescriptionFindings([{ path, text }])).toStrictEqual([openingFinding]);
  });

  test("reports nothing for a description opening on the trigger inside the cap", () => {
    expect.hasAssertions();

    expect(getDescriptionFindings([getSkill(`${DESCRIPTION_OPENING}a`)])).toStrictEqual([]);
  });
});
