import { getRestatedPointerFindings } from "#src/services/sweeps/duplicateProse/getRestatedPointerFindings";
import { describe, expect, test } from "vitest";

describe(getRestatedPointerFindings, () => {
  const ARGUMENT = "the queue holds the overflow for the next run rather than hiding the work from review";
  const OWNER_PATH = "openspec/specs/infra/review/design.md";

  test("reports a settled line restating a page it does not point at", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        {
          path: ".agents/skills/example/SKILL.md",
          text: `## Settled — do not re-propose\n\n- **Excluding files.** ${ARGUMENT}.\n`,
        },
        { path: OWNER_PATH, text: `# Review\n\nRejected: excluding files. ${ARGUMENT}.\n` },
      ]).map(({ otherPath, path }) => `${path} → ${otherPath}`),
    ).toStrictEqual([".agents/skills/example/SKILL.md → openspec/specs/infra/review/design.md"]);
  });

  test("allows a settled line sharing a run with the page it points at", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        {
          path: ".agents/skills/example/SKILL.md",
          text: `## Settled — do not re-propose\n\n- **Excluding files.** ${ARGUMENT} (\`${OWNER_PATH}\`).\n`,
        },
        { path: OWNER_PATH, text: `# Review\n\nRejected: excluding files. ${ARGUMENT}.\n` },
      ]),
    ).toStrictEqual([]);
  });

  test("ignores a run two pages share outside a pointer line", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        { path: ".agents/skills/example/SKILL.md", text: `# Example\n\n${ARGUMENT}.\n` },
        { path: OWNER_PATH, text: `# Review\n\n${ARGUMENT}.\n` },
      ]),
    ).toStrictEqual([]);
  });
});
