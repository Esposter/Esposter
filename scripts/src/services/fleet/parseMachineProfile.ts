import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const checkIsStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// The profile a machine file holds, or undefined for a file missing its id, areas or capabilities
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
        checkIsStringArray(profileValue.capabilities);
      return isComplete ? (profileValue as MachineProfile) : undefined;
    },
    () => undefined,
  );
