import type { ExecFileOutputStream } from "#src/models/exec/util/ExecFileOutputStream";

// A failed execFileHidden spawn, carrying the child's output decoded with the encoding that child actually writes —
// Node's own error decodes both streams with the single `encoding` option, so a child whose stderr is not the stdout
// Encoding (wsl.exe writes its own diagnostics as UTF-16LE) lands in the message as NUL-interleaved garbage the
// Terminal renders invisible, leaving a bare "Command failed: wsl.exe …" with no reason. Extends Error so it survives
// `getResult`'s toAppError untouched and stays instanceof-checkable; the original error is kept as `cause` so its
// `status`/`signal`/`code` remain reachable.
export class ExecFileError extends Error {
  // Why the child failed, in its own words: its stderr, or its stdout when stderr is empty — wsl.exe prints its own
  // Launch failures ("Insufficient system resources … Error code: Wsl/Service/…") on stdout, so a stderr-only reason
  // Reads blank for exactly the failure most worth naming.
  readonly reason: string;
  // Node assigns the spawn result onto the error it throws, so a child killed by a signal — a timeout's SIGTERM —
  // Names it here. Surfaced beside stderr because a killed child's output is a truncated fragment rather than a
  // Verdict on what it did, which anything classifying that stderr has to be able to tell apart
  // (createSourceMirrorArchive)
  readonly signal?: string;
  readonly stderr: string;

  constructor(
    file: string,
    args: readonly string[],
    { stderr, stdout }: Record<ExecFileOutputStream, string>,
    cause: Error,
  ) {
    const reason = stderr || stdout;
    super(`Command failed: ${[file, ...args].join(" ")}\n${reason}`, { cause });
    this.name = "ExecFileError";
    this.reason = reason;
    this.stderr = stderr;
    if ("signal" in cause && typeof cause.signal === "string") this.signal = cause.signal;
  }
}
