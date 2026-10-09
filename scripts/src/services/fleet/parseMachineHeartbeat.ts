import type { MachineHeartbeat } from "#src/models/fleet/MachineHeartbeat";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const checkIsHeartbeat = (value: unknown): value is MachineHeartbeat =>
  typeof value === "object" &&
  value !== null &&
  "machine" in value &&
  typeof value.machine === "string" &&
  "at" in value &&
  typeof value.at === "string" &&
  "cpu" in value &&
  typeof value.cpu === "number" &&
  "freeMemory" in value &&
  typeof value.freeMemory === "number" &&
  (!("gpu" in value) || typeof value.gpu === "number");

// The heartbeat a machine's commit carries, or undefined for a commit that is not one
export const parseMachineHeartbeat = (message: string): MachineHeartbeat | undefined =>
  getResult(() => parseMachineJson(message)).match(
    (heartbeatValue) => (checkIsHeartbeat(heartbeatValue) ? heartbeatValue : undefined),
    () => undefined,
  );
