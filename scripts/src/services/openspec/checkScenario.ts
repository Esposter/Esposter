import type { ScenarioBlock } from "#src/models/openspec/ScenarioBlock";

// One behaviour per scenario: an optional GIVEN, one WHEN, one THEN. AND may follow any step, so it is ignored here.
const SEQUENCE_REGEX = /^(?:GIVEN )?WHEN THEN$/u;

export const checkScenario = (path: string, { keywords, line, title }: ScenarioBlock): string[] => {
  const sequence = keywords.filter((keyword) => keyword !== "AND").join(" ");
  if (SEQUENCE_REGEX.test(sequence)) return [];
  return [`${path}:${line}: scenario "${title}" must read GIVEN? WHEN THEN, found "${sequence}"`];
};
