import type { OutcomeRow } from "#src/models/review/OutcomeRow";

import { renderOutcomeTable } from "#src/services/review/issues/renderOutcomeTable";

// The comment an issue gets when its findings settle: the heading over the table of their outcomes
export const renderOutcomeComment = (heading: string, rows: OutcomeRow[]): string =>
  [heading, "", renderOutcomeTable(rows)].join("\n");
