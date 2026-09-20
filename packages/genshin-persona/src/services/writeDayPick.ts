import type { DayPick } from "#src/models/DayPick";

import { DAY_PICK_PATH, STATE_FIELD_SEPARATOR } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeDayPick = ({ element, isoDate, name }: DayPick): void => {
  writeStateFile(DAY_PICK_PATH, [isoDate, name, element].join(STATE_FIELD_SEPARATOR));
};
