interface OutcomeRow {
  finding: string;
  outcome: string;
  reason: string;
}

// A table cell's `|` would end the cell early
const toCell = (text: string): string => text.replaceAll("|", String.raw`\|`);

// The table of findings with the outcome and reason the session gave, one row per finding
export const renderOutcomeTable = (rows: OutcomeRow[]): string =>
  [
    "| Finding | Outcome | Reason |",
    "| --- | --- | --- |",
    ...rows.map(({ finding, outcome, reason }) => `| ${toCell(finding)} | ${outcome} | ${toCell(reason)} |`),
  ].join("\n");

// The comment an issue gets when its findings settle: the heading over the table of their outcomes
export const renderOutcomeComment = (heading: string, rows: OutcomeRow[]): string =>
  [heading, "", renderOutcomeTable(rows)].join("\n");
