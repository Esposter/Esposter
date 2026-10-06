import type { InvestigationOutcome } from "#src/models/reference/InvestigationOutcome";

// A search, a measurement or a change tried against the game's data or its recordings: what was run, with its
// Commands and inputs, what came of it, with the numbers it read, and whether that result stands in the component
export interface Investigation {
  method: string;
  outcome: InvestigationOutcome;
  result: string;
}
