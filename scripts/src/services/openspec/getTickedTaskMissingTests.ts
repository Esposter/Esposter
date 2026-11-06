import { getTitleKey } from "#src/services/openspec/getTitleKey";
import { readScenarioClaims } from "#src/services/openspec/readScenarioClaims";
import { readTickedVerifyClauses } from "#src/services/openspec/readTickedVerifyClauses";

// A ticked task says its work is done, and a Verify clause that quotes a scenario after the word `scenario` says the
// Scenario holds in a test of that title. This is each such claim that no test is titled for, as `<task number> "<title>"`.
// A scenario a task only names, in a clause that holds it some other way, is no claim, and nor is a task still open.
export const getTickedTaskMissingTests = (
  tasksText: string,
  scenarioTitles: readonly string[],
  testTitleKeys: ReadonlySet<string>,
): string[] =>
  readTickedVerifyClauses(tasksText).flatMap(({ number, verify }) =>
    readScenarioClaims(verify, scenarioTitles)
      .filter((title) => !testTitleKeys.has(getTitleKey(title)))
      .map((title) => `${number} "${title}"`),
  );
