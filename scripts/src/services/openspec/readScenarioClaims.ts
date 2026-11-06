import { readQuotedTitle } from "#src/services/openspec/readQuotedTitle";

// The word that makes a quote a claim: a title quoted after `scenario` or `scenarios` is a scenario the delta must hold
const SCENARIO_WORD_REGEX = /\bscenarios?\s+/giu;
// What joins one quoted title to the next in a list: a comma, `and` or `or`
const LIST_CONNECTOR_REGEX = /^(?:\s*,\s*(?:(?:and|or)\s+)?|\s+(?:and|or)\s+)/u;

// Every title a text quotes after the word `scenario` or `scenarios`, in reading order, a list of them included. A title
// Is read whole where the delta holds it, so an apostrophe inside it is part of it.
export const readScenarioClaims = (text: string, scenarioTitles: readonly string[]): string[] => {
  const claims: string[] = [];
  for (const scenarioWord of text.matchAll(SCENARIO_WORD_REGEX)) {
    let rest = text.slice(scenarioWord.index + scenarioWord[0].length);
    let quoted = readQuotedTitle(rest, scenarioTitles);
    while (quoted) {
      claims.push(quoted.slice(1, -1));
      const afterTitle = rest.slice(quoted.length);
      const connector = LIST_CONNECTOR_REGEX.exec(afterTitle)?.[0] ?? "";
      rest = afterTitle.slice(connector.length);
      quoted = connector ? readQuotedTitle(rest, scenarioTitles) : "";
    }
  }
  return claims;
};
