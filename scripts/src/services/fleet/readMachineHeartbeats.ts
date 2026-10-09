import type { MachineHeartbeat } from "#src/models/fleet/MachineHeartbeat";

import { FLEET_LOCAL_MACHINE_PREFIX, MACHINE_REF_PREFIX } from "#src/services/fleet/constants";
import { parseMachineHeartbeat } from "#src/services/fleet/parseMachineHeartbeat";
import { readFleetRefLines } from "#src/services/fleet/readFleetRefLines";

// The latest heartbeat of every machine on the remote, by machine id
export const readMachineHeartbeats = (): Map<string, MachineHeartbeat> =>
  new Map(
    readFleetRefLines(MACHINE_REF_PREFIX, FLEET_LOCAL_MACHINE_PREFIX).flatMap(({ id, message }) => {
      const heartbeat = parseMachineHeartbeat(message);
      return heartbeat === undefined ? [] : [[id, heartbeat] as const];
    }),
  );
