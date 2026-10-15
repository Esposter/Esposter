import { lintScenarios } from "#src/services/openspec/lintScenarios";
import { describe, expect, test } from "vitest";

describe(lintScenarios, () => {
  const SPEC_PATH = "openspec/changes/example/specs/example/spec.md";

  test("accepts a scenario of WHEN then THEN, with GIVEN and AND steps where they belong", () => {
    expect.hasAssertions();

    const markdown = [
      "### Requirement: Example",
      "The system SHALL example.",
      "",
      "#### Scenario: Refused input",
      "- **GIVEN** a signed-in user",
      "- **WHEN** the user submits an empty name",
      "- **THEN** the form is refused",
      "- **AND** no record is written",
    ].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([]);
  });

  test("accepts a scenario with no GIVEN step", () => {
    expect.hasAssertions();

    const markdown = ["#### Scenario: Opens", "- **WHEN** the page loads", "- **THEN** the list is shown"].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([]);
  });

  test("reports a scenario with no THEN step", () => {
    expect.hasAssertions();

    const markdown = ["#### Scenario: Opens", "- **WHEN** the page loads"].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:1: scenario "Opens" must read GIVEN? WHEN THEN, found "WHEN"`,
    ]);
  });

  test("reports a scenario whose THEN comes before its WHEN", () => {
    expect.hasAssertions();

    const markdown = ["#### Scenario: Opens", "- **THEN** the list is shown", "- **WHEN** the page loads"].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:1: scenario "Opens" must read GIVEN? WHEN THEN, found "THEN WHEN"`,
    ]);
  });

  test("reports a scenario that holds two behaviours", () => {
    expect.hasAssertions();

    const markdown = [
      "#### Scenario: Two outcomes",
      "- **WHEN** the page loads",
      "- **THEN** the list is shown",
      "- **THEN** the count is shown",
    ].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:1: scenario "Two outcomes" must read GIVEN? WHEN THEN, found "WHEN THEN THEN"`,
    ]);
  });

  test("reports prose inside a scenario and keeps reading the steps after it", () => {
    expect.hasAssertions();

    const markdown = [
      "#### Scenario: Opens",
      "The list is usually shown quickly.",
      "- **WHEN** the page loads",
      "- **THEN** the list is shown",
    ].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([
      `${SPEC_PATH}:2: scenario "Opens" holds prose; use "- **WHEN** ..." steps only`,
    ]);
  });

  test("ignores prose outside scenarios, so a requirement body is not read as steps", () => {
    expect.hasAssertions();

    const markdown = [
      "## Purpose",
      "A capability that does a thing for a reader who needs it done.",
      "",
      "### Requirement: Example",
      "The system SHALL example, with prose and a path such as `src/example.ts`.",
      "",
      "#### Scenario: Opens",
      "- **WHEN** the page loads",
      "- **THEN** the list is shown",
      "",
      "## Notes",
      "Closing prose after the last scenario.",
    ].join("\n");

    expect(lintScenarios(SPEC_PATH, markdown)).toStrictEqual([]);
  });
});
