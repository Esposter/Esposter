import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";

import { LENGTH_REGEX, LENGTH_UNIT_PIXELS_MAP } from "#shared/services/pageBuilder/critique/constants";
import { takeOne } from "@esposter/shared";

// A length the critique can read in pixels at the phone, or nothing for a value it cannot read, such as a percentage
export const getLengthInPixels = (value: StyleValue): number | undefined => {
  const match = LENGTH_REGEX.exec(value);
  if (!match) return undefined;

  return Number(takeOne(match, 1)) * takeOne(LENGTH_UNIT_PIXELS_MAP, takeOne(match, 2));
};
