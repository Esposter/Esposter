import { FLEET_FILL_MAX_TARGET } from "#src/services/fleet/constants";
import { parseFillTarget } from "#src/services/fleet/parseFillTarget";

// The live claims this machine keeps: the `--target` given, else its profile's fill target, else its logical core count
// Capped at the maximum
export const getFillTarget = (value: string, profileTarget: number | undefined, coreCount: number): number => {
  if (value !== "") return parseFillTarget(value);
  return profileTarget ?? Math.min(coreCount, FLEET_FILL_MAX_TARGET);
};
