import type { OutcomeRow } from "#src/models/review/OutcomeRow";

import { toCell } from "#src/services/review/issues/toCell";

// The table of findings with the outcome and reason the session gave, one row per finding
export const renderOutcomeTable = (rows: OutcomeRow[]): string =>
  [
    "| Finding | Outcome | Reason |",
    "| --- | --- | --- |",
    ...rows.map(({ finding, outcome, reason }) => `| ${toCell(finding)} | ${outcome} | ${toCell(reason)} |`),
  ].join("\n");
