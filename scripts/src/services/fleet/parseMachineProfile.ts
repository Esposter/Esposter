import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { checkIsFillKind } from "#src/services/fleet/checkIsFillKind";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const checkIsStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const checkIsFillKindArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item) => typeof item === "string" && checkIsFillKind(item));
const checkIsFillTarget = (value: unknown): boolean =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

// The profile a machine file holds, or undefined for a file missing its id, areas or capabilities, or holding a fill
// Target or fill kinds that are not whole claims or fill kinds
export const parseMachineProfile = (json: string): MachineProfile | undefined =>
  getResult(() => parseMachineJson(json)).match(
    (profileValue) => {
      if (typeof profileValue !== "object" || profileValue === null) return undefined;
      const isComplete =
        "id" in profileValue &&
        typeof profileValue.id === "string" &&
        "areas" in profileValue &&
        checkIsStringArray(profileValue.areas) &&
        "capabilities" in profileValue &&
        checkIsStringArray(profileValue.capabilities) &&
        (!("fillTarget" in profileValue) || checkIsFillTarget(profileValue.fillTarget)) &&
        (!("fillKinds" in profileValue) || checkIsFillKindArray(profileValue.fillKinds));
      return isComplete ? (profileValue as MachineProfile) : undefined;
    },
    () => undefined,
  );
