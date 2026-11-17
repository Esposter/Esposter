import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { checkIsMachineProfile } from "#src/services/fleet/checkIsMachineProfile";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// The profile a machine file holds, or undefined for a file missing its id, areas or capabilities
export const parseMachineProfile = (json: string): MachineProfile | undefined =>
  getResult(() => parseMachineJson(json)).match(
    (profileValue) => (checkIsMachineProfile(profileValue) ? profileValue : undefined),
    () => undefined,
  );
