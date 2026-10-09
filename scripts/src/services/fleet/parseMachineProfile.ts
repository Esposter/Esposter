import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const checkIsStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// The profile a machine file holds, or undefined for a file missing its id, areas or capabilities
export const parseMachineProfile = (json: string): MachineProfile | undefined =>
  getResult(() => parseMachineJson<unknown>(json)).match(
    (parsed) => {
      if (typeof parsed !== "object" || parsed === null) return undefined;
      const isComplete =
        "id" in parsed &&
        typeof parsed.id === "string" &&
        "areas" in parsed &&
        checkIsStringArray(parsed.areas) &&
        "capabilities" in parsed &&
        checkIsStringArray(parsed.capabilities);
      return isComplete ? (parsed as MachineProfile) : undefined;
    },
    () => undefined,
  );
