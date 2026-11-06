import { SCENARIO_HEADING_REGEX } from "#src/services/openspec/constants";

// The title a spec delta's scenario heading carries, or `""` for a line that is no scenario heading
export const getScenarioTitle = (line: string): string =>
  (SCENARIO_HEADING_REGEX.exec(line)?.groups?.title ?? "").trim();
