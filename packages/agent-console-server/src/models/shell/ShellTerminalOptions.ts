import type { TerminalSize } from "#src/models/command/TerminalSize";

export interface ShellTerminalOptions extends TerminalSize {
  cwd: string;
}
