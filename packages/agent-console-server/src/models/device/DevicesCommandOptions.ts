import type { KeyObject } from "node:crypto";

export interface DevicesCommandOptions {
  hostKey: KeyObject;
  // Where a running host is reached, to close a revoked device's socket
  hostname: string;
  port: number;
  // The device to remove, or "" to list them all
  revokeDeviceId: string;
  stateDirectory: string;
}
