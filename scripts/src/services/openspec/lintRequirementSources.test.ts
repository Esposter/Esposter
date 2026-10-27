import { lintRequirementSources } from "#src/services/openspec/lintRequirementSources";
import { describe, expect, test } from "vitest";

describe(lintRequirementSources, () => {
  const SPEC_PATH = "openspec/specs/example/spec.md";

  test("accepts a requirement body that states only behaviour", () => {
    expect.hasAssertions();

    const markdown = [
      "### Requirement: Example",
      "The system SHALL example.",
      "",
      "#### Scenario: Example",
      "- **GIVEN** a signed-in user",
      "- **WHEN** the user submits an empty name",
      "- **THEN** the form is refused",
    ].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([]);
  });

  test("reports a source path in a requirement body", () => {
    expect.hasAssertions();

    const markdown = [
      "### Requirement: Example",
      "The system SHALL example (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/example/skill.go` lines 21 to 23).",
    ].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:2: requirement "Example" cites a source in its body; move the citation to the design's Sources or Key files`,
    ]);
  });

  test("reports a bare source file name in a requirement body", () => {
    expect.hasAssertions();

    const markdown = ["### Requirement: Example", "The system SHALL follow `skill.go` line 22."].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:2: requirement "Example" cites a source in its body; move the citation to the design's Sources or Key files`,
    ]);
  });

  test("ignores a source path in a scenario, which keeps its own evidence", () => {
    expect.hasAssertions();

    const markdown = [
      "### Requirement: Example",
      "The system SHALL example.",
      "",
      "#### Scenario: Example",
      "- **THEN** the form is refused (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/example/skill.go` line 22)",
    ].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([]);
  });

  test("ignores the text between two code spans on one line", () => {
    expect.hasAssertions();

    const markdown = ["### Requirement: Example", "The system SHALL accept `add` / `remove` operations."].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([]);
  });

  test("ignores a backticked identifier that names no file", () => {
    expect.hasAssertions();

    const markdown = ["### Requirement: Example", "The system SHALL return `Operation.Add` as `undefined`."].join("\n");

    expect(lintRequirementSources(SPEC_PATH, markdown)).toStrictEqual([]);
  });
});
