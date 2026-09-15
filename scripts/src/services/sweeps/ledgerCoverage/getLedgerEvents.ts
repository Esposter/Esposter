import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { TRAILER_VALUE_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

const LEDGER_EVENT_TYPES = Object.values(LedgerEventType);
const TRAILER_REGEX = new RegExp(String.raw`^(?<type>${LEDGER_EVENT_TYPES.join("|")}):(?<value>.*)$`, "gmu");

// The log is read oldest first, so the events come back in the order they happened and a later one wins. A
// `Ledger:` value without its unit names nothing a row can match and is skipped; a `Reopens:` without one names
// The whole ledger, which is the shape a rule change wants.
export const getLedgerEvents = (log: string): LedgerEvent[] =>
  log
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .flatMap((record) => {
      const [date = "", body = ""] = record.split(FIELD_SEPARATOR);
      return Array.from(body.matchAll(TRAILER_REGEX), ({ groups }) => {
        const type = LEDGER_EVENT_TYPES.find((candidate) => candidate === groups?.type);
        const [ledger = "", unit] = (groups?.value ?? "").trim().split(TRAILER_VALUE_SEPARATOR);
        return type !== undefined && ledger !== "" && (type === LedgerEventType.Reopens || unit !== undefined)
          ? { date, ledger, type, unit: unit?.trim() }
          : undefined;
      }).filter((event) => event !== undefined);
    });
