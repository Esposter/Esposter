import type { MachineHeartbeat } from "#src/models/fleet/MachineHeartbeat";

import { lastPushSchema } from "#src/models/shared/LastPush";
import { checkIsInstant } from "#src/services/fleet/checkIsInstant";

export const checkIsHeartbeat = (value: unknown): value is MachineHeartbeat =>
  typeof value === "object" &&
  value !== null &&
  "machine" in value &&
  typeof value.machine === "string" &&
  "at" in value &&
  checkIsInstant(value.at) &&
  "cpu" in value &&
  typeof value.cpu === "number" &&
  "freeMemory" in value &&
  typeof value.freeMemory === "number" &&
  (!("gpu" in value) || typeof value.gpu === "number") &&
  (!("lastPush" in value) || lastPushSchema.safeParse(value.lastPush).success) &&
  (!("platform" in value) || typeof value.platform === "string");
