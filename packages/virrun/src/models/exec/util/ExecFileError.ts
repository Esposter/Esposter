// A failed execFileHidden spawn, carrying the child's stderr decoded with the encoding that child actually writes —
// Node's own error decodes both streams with the single `encoding` option, so a child whose stderr is not the stdout
// Encoding (wsl.exe writes its own diagnostics as UTF-16LE) lands in the message as NUL-interleaved garbage the
// Terminal renders invisible, leaving a bare "Command failed: wsl.exe …" with no reason. Extends Error so it survives
// GetResult's toAppError untouched and stays instanceof-checkable; the original error is kept as `cause` so its
// `status`/`signal`/`code` remain reachable.
export class ExecFileError extends Error {
  readonly stderr: string;

  constructor(file: string, args: readonly string[], stderr: string, cause: Error) {
    super(`Command failed: ${[file, ...args].join(" ")}\n${stderr}`, { cause });
    this.name = "ExecFileError";
    this.stderr = stderr;
  }
}
