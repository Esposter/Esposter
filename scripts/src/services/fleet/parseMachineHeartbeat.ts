import type { MachineHeartbeat } from "#src/models/fleet/MachineHeartbeat";

import { checkIsHeartbeat } from "#src/services/fleet/checkIsHeartbeat";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// The heartbeat a machine's commit carries, or undefined for a commit that is not one
export const parseMachineHeartbeat = (message: string): MachineHeartbeat | undefined =>
  getResult(() => parseMachineJson(message)).match(
    (heartbeatValue) => (checkIsHeartbeat(heartbeatValue) ? heartbeatValue : undefined),
    () => undefined,
  );
