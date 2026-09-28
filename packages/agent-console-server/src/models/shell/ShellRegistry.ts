import type { ShellEntry } from "#src/models/shell/ShellEntry";
import type { ShellTerminalOptions } from "#src/models/shell/ShellTerminalOptions";

export interface ShellRegistry {
  close: (shellId: string) => void;
  // Ends every shell, the host's own close
  closeAll: () => void;
  closeSession: (sessionId: string) => void;
  entries: () => ShellEntry[];
  // Resolves to the new shell's id
  open: (sessionId: string, options: ShellTerminalOptions) => Promise<string>;
  resize: (shellId: string, cols: number, rows: number) => void;
  write: (shellId: string, data: string) => void;
}
