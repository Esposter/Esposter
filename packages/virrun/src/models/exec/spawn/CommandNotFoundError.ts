// The error a missing win32 command surfaces as, shaped as node reports an ENOENT spawn so a reader matching the
// Message or the code sees the same failure whichever way the command was missing.
export class CommandNotFoundError extends Error {
  readonly code = "ENOENT";
  readonly path: string;
  readonly spawnargs: readonly string[];
  readonly syscall: string;

  constructor(syscall: string, command: string, args: readonly string[]) {
    super(`${syscall} ${command} ENOENT`);
    this.name = "CommandNotFoundError";
    this.path = command;
    this.spawnargs = args;
    this.syscall = `${syscall} ${command}`;
  }
}
