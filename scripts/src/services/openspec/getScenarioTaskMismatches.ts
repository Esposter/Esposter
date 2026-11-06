import type { ScenarioTaskMismatches } from "#src/models/openspec/ScenarioTaskMismatches";

import { readQuotedTitle } from "#src/services/openspec/readQuotedTitle";

// The word that makes a quote a claim: a title quoted after `scenario` or `scenarios` is a scenario the delta must hold
const SCENARIO_WORD_REGEX = /\bscenarios?\s+/giu;
// Each quote mark a task opens or closes a title with; a quote is read from each one
const QUOTE_MARK_REGEX = /['"]/gu;
// What joins one quoted title to the next in a list: a comma, `and` or `or`
const LIST_CONNECTOR_REGEX = /^(?:\s*,\s*(?:(?:and|or)\s+)?|\s+(?:and|or)\s+)/u;

// A scenario is named when a task quotes its title as the delta holds it, wherever the quote stands.
// So it is unnamed only when no quote of it appears.
// A quote after the word is more than a name: it claims the delta holds that scenario.
// Only those quotes are checked against the delta.
// A title is matched as written, apostrophes and letter case included.
export const getScenarioTaskMismatches = (
  tasksText: string,
  scenarioTitles: readonly string[],
): ScenarioTaskMismatches => {
  const unheldByDelta = new Set<string>();
  for (const scenarioWord of tasksText.matchAll(SCENARIO_WORD_REGEX)) {
    let rest = tasksText.slice(scenarioWord.index + scenarioWord[0].length);
    let quoted = readQuotedTitle(rest, scenarioTitles);
    while (quoted) {
      const title = quoted.slice(1, -1);
      if (!scenarioTitles.includes(title)) unheldByDelta.add(title);
      const afterTitle = rest.slice(quoted.length);
      const connector = LIST_CONNECTOR_REGEX.exec(afterTitle)?.[0] ?? "";
      rest = afterTitle.slice(connector.length);
      quoted = connector ? readQuotedTitle(rest, scenarioTitles) : "";
    }
  }
  const quotedTitles = new Set(
    Array.from(tasksText.matchAll(QUOTE_MARK_REGEX), ({ index }) =>
      readQuotedTitle(tasksText.slice(index), scenarioTitles).slice(1, -1),
    ),
  );
  const unnamedByTasks = scenarioTitles.filter((title) => !quotedTitles.has(title));
  return { unheldByDelta: [...unheldByDelta], unnamedByTasks };
};
