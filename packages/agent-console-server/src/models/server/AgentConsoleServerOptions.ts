import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { ShellTerminal } from "#src/models/shell/ShellTerminal";
import type { ShellTerminalOptions } from "#src/models/shell/ShellTerminalOptions";
import type { KeyObject } from "node:crypto";

export interface AgentConsoleServerOptions {
  createDriver: (callbacks: DriverCallbacks) => Driver;
  // The private key the host signs every challenge with, and checks its own executable's signatures against
  hostKey: KeyObject;
  hostname: string;
  // The one origin whose pages may connect and pair: the deployed app's, or the dev server's under `--origin`
  origin: string;
  // 0 takes any free port, which the running server reports
  port: number;
  // Starts a shell under a pseudo-terminal, for the page's shell tab
  spawnShell: (options: ShellTerminalOptions) => Promise<ShellTerminal>;
  // Where the paired devices are kept
  stateDirectory: string;
  // The host window's log of each device paired and revoked
  writeLine: (line: string) => void;
}
