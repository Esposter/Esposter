import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";

// A row names its kit with or without the backticks, and its swept cell is a date or the open dash, so the header and
// The separator never match
const ROW_REGEX = /^\|\s*`?(?<unit>[^`|]+?)`?\s*\|\s*(?<swept>(?:\d{4}-\d{2}-\d{2}|—)[^|]*?)\s*\|/u;
// The kits a dated `kit-records` row names whose overlay still holds an `Unclassified` entry. That is the cause a
// Value takes until its kit's row is swept, and it leaves the enum with the last row, so a row is swept only when
// None is left: a dated row holding one was dated for a pass that left its entries unread, and its kit reopens.
export const getSweptKitsHoldingUnclassified = (text: string, readOverlay: (kit: string) => KitOverlay): string[] =>
  text.split("\n").flatMap((line) => {
    const { swept, unit } = ROW_REGEX.exec(line)?.groups ?? {};
    return unit !== undefined &&
      swept !== OPEN_CELL &&
      Object.values(readOverlay(unit)).some(
        (entry) => "cause" in entry && entry.cause === KitProvisionalCause.Unclassified,
      )
      ? [unit]
      : [];
  });
