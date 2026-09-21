import type { Nameplate } from "#src/models/Nameplate";

import { PIN_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writePin = ({ displayName, element, name }: Nameplate): void => {
  writeStateFile(PIN_PATH, [name, element, displayName].join(STATE_FIELD_SEPARATOR));
};
