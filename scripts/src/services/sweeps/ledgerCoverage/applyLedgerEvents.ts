import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";

const ROW_REGEX = /^\| (?<unit>.+?) \|(?<swept>[^|]*)\|(?<rest>.*)$/u;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/u;

const checkIsLedgerEvent = (ledger: string, { ledger: eventLedger }: LedgerEvent) =>
  eventLedger === ledger || ledger.startsWith(`${eventLedger}/`);

// The file is the readable record and its cell is the starting state, so a hand-written date still counts and
// The script never lowers one on its own: a sweep raises the cell to its date, and a reopen clears it only when
// It is not older than what the cell already says — a reset that predates the pass it would undo is stale. The
// Events arrive in commit order, so a sweep landing after a same-day reopen dates the row again.
export const applyLedgerEvents = (
  text: string,
  ledger: string,
  events: LedgerEvent[],
): { text: string; unmatched: LedgerEvent[] } => {
  const ledgerEvents = events.filter((event) => checkIsLedgerEvent(ledger, event));
  const matched = new Set<LedgerEvent>();
  const lines = text.split("\n").map((line) => {
    const groups = ROW_REGEX.exec(line)?.groups;
    if (!groups) return line;

    const { rest, swept, unit } = groups;
    const cell = swept.trim();
    if (cell !== OPEN_CELL && !DATE_REGEX.test(cell)) return line;

    let date = cell === OPEN_CELL ? undefined : cell;
    for (const event of ledgerEvents) {
      if (event.unit !== undefined && event.unit !== unit) continue;

      matched.add(event);
      if (event.type === LedgerEventType.Ledger) date = date === undefined || event.date > date ? event.date : date;
      else if (date === undefined || event.date >= date) date = undefined;
    }
    return `| ${unit} |${(date ?? OPEN_CELL).padEnd(swept.length - 1).padStart(swept.length)}|${rest}`;
  });
  return {
    text: lines.join("\n"),
    unmatched: ledgerEvents.filter((event) => event.unit !== undefined && !matched.has(event)),
  };
};
