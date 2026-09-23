import type { AppliedLedgerEvents } from "#src/models/sweeps/ledgerCoverage/AppliedLedgerEvents";
import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { OPEN_CELL, SWEPT_CELL_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

const ROW_REGEX = /^\|(?<unitCell>[^|]*)\|(?<sweptCell>[^|]*)\|(?<rest>.*)$/u;
const SWEPT_CELL_REGEX = new RegExp(
  String.raw`^(?<cellDate>\d{4}-\d{2}-\d{2})(?:${SWEPT_CELL_SEPARATOR}(?<cellModel>.+))?$`,
  "u",
);
// The file is the readable record and its cell is the starting state, so a hand-written date still counts and
// The script never lowers one on its own: a sweep raises the cell to its date and the model its commit names, and
// A reopen clears it only when it is not older than what the cell already says — a reset that predates the pass it
// Would undo is stale. The events arrive in author-date order, so a sweep landing after a same-day reopen dates the
// Row again, and a same-day sweep names the model of the later pass.
// A trailer naming a ledger that was since split into a coverage folder is in scope for every area file in it,
// And its unit is a row in exactly one of them, so which events went unmatched is the caller's to decide once
// Across the folder rather than this function's to answer per file.
export const applyLedgerEvents = (text: string, ledger: string, events: LedgerEvent[]): AppliedLedgerEvents => {
  const ledgerEvents = events.filter(
    ({ ledger: eventLedger }) => eventLedger === ledger || ledger.startsWith(`${eventLedger}/`),
  );
  const matched = new Set<LedgerEvent>();
  const lines = text.split("\n").map((line) => {
    const groups = ROW_REGEX.exec(line)?.groups;
    if (!groups) return line;

    const { rest = "", sweptCell = "", unitCell = "" } = groups;
    const unit = unitCell.trim();
    const cell = sweptCell.trim();
    const sweptGroups = SWEPT_CELL_REGEX.exec(cell)?.groups;
    if (cell !== OPEN_CELL && !sweptGroups) return line;

    let date = sweptGroups?.cellDate;
    let model = sweptGroups?.cellModel ?? "";
    for (const event of ledgerEvents) {
      if (event.unit !== undefined && event.unit !== unit) continue;

      matched.add(event);
      if (event.type === LedgerEventType.Ledger) {
        if (date !== undefined && event.date < date) continue;

        date = event.date;
        ({ model } = event);
      } else if (date === undefined || event.date >= date) date = undefined;
    }
    // The cell keeps its width so the table stays aligned until the formatter next runs
    let swept = OPEN_CELL;
    if (date !== undefined) swept = model === "" ? date : `${date}${SWEPT_CELL_SEPARATOR}${model}`;
    return `|${unitCell}| ${swept.padEnd(sweptCell.length - 2)} |${rest}`;
  });
  return { matched: [...matched], text: lines.join("\n") };
};
