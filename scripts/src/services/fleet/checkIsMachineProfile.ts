import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { checkIsStringArray } from "#src/services/fleet/checkIsStringArray";

// Whether a parsed machine file holds a profile: an object with its id as a string and its areas and capabilities as string arrays
export const checkIsMachineProfile = (value: unknown): value is MachineProfile =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "areas" in value &&
  checkIsStringArray(value.areas) &&
  "capabilities" in value &&
  checkIsStringArray(value.capabilities);
