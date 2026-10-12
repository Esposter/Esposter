export interface OutcomeRow {
  finding: string;
  outcome: string;
  reason: string;
}

// A table cell's `|` would end the cell early
const toCell = (text: string): string => text.replaceAll("|", String.raw`\|`);

// The comment an issue gets when its findings settle: one row per finding, with the outcome and reason the session gave
export const renderOutcomeComment = (heading: string, rows: OutcomeRow[]): string =>
  [
    heading,
    "",
    "| Finding | Outcome | Reason |",
    "| --- | --- | --- |",
    ...rows.map(({ finding, outcome, reason }) => `| ${toCell(finding)} | ${outcome} | ${toCell(reason)} |`),
  ].join("\n");
