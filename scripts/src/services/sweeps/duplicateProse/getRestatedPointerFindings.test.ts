import { getRestatedPointerFindings } from "#src/services/sweeps/duplicateProse/getRestatedPointerFindings";
import { describe, expect, test } from "vitest";

describe(getRestatedPointerFindings, () => {
  const ARGUMENT = "the collector holds the overflow for the next window rather than hiding the work from review";
  const OWNER_PATH = "apps/web/content/docs/infra/review-collector/index.md";

  test("reports a settled line restating a page it does not point at", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        {
          path: ".agents/skills/coderabbit/SKILL.md",
          text: `## Settled — do not re-propose\n\n- **Excluding files.** ${ARGUMENT}.\n`,
        },
        { path: OWNER_PATH, text: `# Review Collector\n\nRejected: excluding files. ${ARGUMENT}.\n` },
      ]).map(({ otherPath, path }) => `${path} → ${otherPath}`),
    ).toStrictEqual([".agents/skills/coderabbit/SKILL.md → apps/web/content/docs/infra/review-collector/index.md"]);
  });

  test("allows a settled line sharing a run with the page it points at", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        {
          path: ".agents/skills/coderabbit/SKILL.md",
          text: `## Settled — do not re-propose\n\n- **Excluding files.** ${ARGUMENT} (\`${OWNER_PATH}\`).\n`,
        },
        { path: OWNER_PATH, text: `# Review Collector\n\nRejected: excluding files. ${ARGUMENT}.\n` },
      ]),
    ).toStrictEqual([]);
  });

  test("ignores a run two pages share outside a pointer line", () => {
    expect.hasAssertions();

    expect(
      getRestatedPointerFindings([
        { path: ".agents/skills/coderabbit/SKILL.md", text: `# CodeRabbit\n\n${ARGUMENT}.\n` },
        { path: OWNER_PATH, text: `# Review Collector\n\n${ARGUMENT}.\n` },
      ]),
    ).toStrictEqual([]);
  });
});
