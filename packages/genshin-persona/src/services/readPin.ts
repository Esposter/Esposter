import type { Nameplate } from "#src/models/Nameplate";

import { PIN_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// A pin written before the element was kept reads back with none: the name still pins, the colour is lost
export const readPin = (): Nameplate | undefined => {
  if (!existsSync(PIN_PATH)) return undefined;

  const [name = "", element = ""] = readFileSync(PIN_PATH, "utf8").trim().split(STATE_FIELD_SEPARATOR);
  return name ? { element, name } : undefined;
};
