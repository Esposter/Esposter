// The title a spec delta's scenario heading carries, or `""` for a line that is no scenario heading
const SCENARIO_HEADING_REGEX = /^####\s+Scenario:\s*(?<title>.*)$/u;

export const getScenarioTitle = (line: string): string =>
  (SCENARIO_HEADING_REGEX.exec(line)?.groups?.title ?? "").trim();
