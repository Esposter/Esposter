import type { Nameplate } from "#src/models/Nameplate";

import { PIN_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";

// A pin written before a field was kept reads back without it: the name still pins, the colour is lost, and the
// Name stands in for its own display until the pin is written again
export const readPin = (): Nameplate | undefined => {
  if (!existsSync(PIN_PATH)) return undefined;

  const [name = "", element = "", displayName = ""] = readFileSync(PIN_PATH, "utf8")
    .trim()
    .split(STATE_FIELD_SEPARATOR);
  return name ? { displayName: displayName || name, element, name } : undefined;
};
