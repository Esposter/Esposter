import type { DevResult } from "#src/models/dev/DevResult";
import type { DevScenario } from "#src/models/dev/DevScenario";

// Runs a scenario's lines in order and stops at the first that fails, naming the scenario and the line that stopped it
export const runDevScenario = (run: (line: string) => DevResult, scenario: DevScenario): DevResult => {
  for (const line of scenario.lines) {
    const result = run(line);
    if (!result.ok) return { ...result, error: `${scenario.name} stopped at "${line}": ${result.error}` };
  }

  return { ok: true, value: scenario.lines.length };
};
