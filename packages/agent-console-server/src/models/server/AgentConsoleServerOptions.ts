import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";

export interface AgentConsoleServerOptions {
  createDriver: (callbacks: DriverCallbacks) => Driver;
  hostname: string;
  // 0 takes any free port, which the running server reports
  port: number;
  token: string;
}
