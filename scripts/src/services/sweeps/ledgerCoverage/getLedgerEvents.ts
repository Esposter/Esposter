import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType, LedgerEventTypes } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { SWEPT_CELL_SEPARATOR, TRAILER_VALUE_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

const TRAILER_REGEX = new RegExp(String.raw`^(?<type>${LedgerEventTypes.join("|")}):(?<value>.*)$`, "gmu");
const CO_AUTHOR_MODEL_REGEX = /^Co-Authored-By: Claude (?<model>[^(<]+?) *[(<]/imu;
const CARRIED_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/u;
const DEFECTS_REGEX = /^\d+$/u;

// One trailer's value read as the event it records, or undefined for a value that records nothing: a sweep without its
// Unit, a sample without its count, or a carried date that is not a date. A reopen without a unit names the whole
// Ledger, which is the shape a rule change with no find recipe wants.
const getLedgerEvent = (type: LedgerEventType, value: string, date: string, model: string): LedgerEvent | undefined => {
  const [ledger = "", second, carried] = value.trim().split(TRAILER_VALUE_SEPARATOR);
  if (ledger === "") return undefined;

  if (type === LedgerEventType.Sampled) {
    const defects = second?.split(SWEPT_CELL_SEPARATOR)[1];
    return defects !== undefined && DEFECTS_REGEX.test(defects)
      ? { date, defects: Number(defects), ledger, model, type }
      : undefined;
  }

  const unit = second === undefined ? undefined : normalizeLedgerUnit(second);
  if (type === LedgerEventType.Reopens) return { date, ledger, model, type, unit };
  if (unit === undefined) return undefined;
  if (carried === undefined) return { date, ledger, model, type, unit };

  const [carriedDate = "", carriedModel = ""] = carried.split(SWEPT_CELL_SEPARATOR);
  return CARRIED_DATE_REGEX.test(carriedDate)
    ? { date: carriedDate, ledger, model: carriedModel, type, unit }
    : undefined;
};

// The events in the order the log lists them. Every trailer line of a record is read, since a trailer often sits in a
// Paragraph of its own above the co-author lines, which `git interpret-trailers` does not read.
export const getLedgerEvents = (log: string): LedgerEvent[] =>
  getGitRecords(log).flatMap(([date = "", body = ""]) => {
    const model = CO_AUTHOR_MODEL_REGEX.exec(body)?.groups?.model ?? "";
    return Array.from(body.matchAll(TRAILER_REGEX), ({ groups }) => {
      const type = LedgerEventTypes.find((candidate) => candidate === groups?.type);
      return type === undefined ? undefined : getLedgerEvent(type, groups?.value ?? "", date, model);
    }).filter((event) => event !== undefined);
  });
