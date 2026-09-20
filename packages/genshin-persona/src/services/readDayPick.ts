import type { DayPick } from "#src/models/DayPick";

import { DAY_PICK_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

export const readDayPick = (): DayPick | undefined => {
  if (!existsSync(DAY_PICK_PATH)) return undefined;

  const [isoDate = "", name = "", element = ""] = readFileSync(DAY_PICK_PATH, "utf8")
    .trim()
    .split(STATE_FIELD_SEPARATOR);
  return isoDate && name ? { element, isoDate, name } : undefined;
};
