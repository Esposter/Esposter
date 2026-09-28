import type { ShellTerminal } from "#src/models/shell/ShellTerminal";
import type { ShellTerminalOptions } from "#src/models/shell/ShellTerminalOptions";

export interface ShellRegistryOptions {
  onClose: (shellId: string) => void;
  onOutput: (shellId: string, data: string) => void;
  spawnShell: (options: ShellTerminalOptions) => Promise<ShellTerminal>;
}
