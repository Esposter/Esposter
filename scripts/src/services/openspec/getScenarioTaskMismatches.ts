import type { ScenarioTaskMismatches } from "#src/models/openspec/ScenarioTaskMismatches";

import { readQuotedTitle } from "#src/services/openspec/readQuotedTitle";
import { readScenarioClaims } from "#src/services/openspec/readScenarioClaims";

// Each quote mark a task opens or closes a title with; a quote is read from each one
const QUOTE_MARK_REGEX = /['"]/gu;

// A scenario is named when a task quotes its title as the delta holds it, wherever the quote stands.
// So it is unnamed only when no quote of it appears.
// A quote after the word is more than a name: it claims the delta holds that scenario.
// Only those quotes are checked against the delta.
// A title is matched as written, apostrophes and letter case included.
export const getScenarioTaskMismatches = (
  tasksText: string,
  scenarioTitles: readonly string[],
): ScenarioTaskMismatches => {
  const unheldByDelta = new Set(
    readScenarioClaims(tasksText, scenarioTitles).filter((title) => !scenarioTitles.includes(title)),
  );
  const quotedTitles = new Set(
    Array.from(tasksText.matchAll(QUOTE_MARK_REGEX), ({ index }) =>
      readQuotedTitle(tasksText.slice(index), scenarioTitles).slice(1, -1),
    ),
  );
  const unnamedByTasks = scenarioTitles.filter((title) => !quotedTitles.has(title));
  return { unheldByDelta: [...unheldByDelta], unnamedByTasks };
};
