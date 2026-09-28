// A shell under a pseudo-terminal: the part of node-pty's terminal the host uses, so a test drives a fake one
export interface ShellTerminal {
  kill: () => void;
  onData: (listener: (data: string) => void) => unknown;
  onExit: (listener: () => void) => unknown;
  resize: (cols: number, rows: number) => void;
  write: (data: string) => void;
}
