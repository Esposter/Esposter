import type { ExecFileHiddenOptions } from "@/models/exec/util/ExecFileHiddenOptions";

import { ExecFileError } from "@/models/exec/util/ExecFileError";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Bytes of a stderr buffer sampled to recognise its encoding — enough for the shortest diagnostic, cheap for a
// Multi-megabyte one.
const STDERR_SAMPLE_BYTES = 64;
// Which encoding a failed child really wrote its stderr in, detected rather than declared: a call site that has to
// Remember "this one is utf16le" eventually forgets (runOverlayScript spawned wsl.exe without it and turned every
// WSL launch failure into a bare "Command failed:"). UTF-16LE ASCII text pads every character with a trailing NUL,
// A shape utf8 text never has, so the padding identifies itself. Text outside ASCII (a localized wsl.exe) carries no
// Such padding and still reads back as utf8 — undetectable here, and no worse than declaring the encoding wrongly.
// A capture cut mid-character (a timeout kill, a maxBuffer cut) may end on an odd byte; the sample still identifies
// The padding and the decoder drops the dangling byte, instead of falling back to utf8 and NUL-interleaved garbage.
const getStderrEncoding = (stderr: Buffer): BufferEncoding => {
  if (stderr.length < 2) return "utf8";
  const sample = stderr.subarray(0, STDERR_SAMPLE_BYTES);
  const isNulPadded = sample.every((byte, index) => index % 2 === 0 || byte === 0);
  return isNulPadded && sample.some((byte, index) => index % 2 === 0 && byte > 0) ? "utf16le" : "utf8";
};
// Node hangs the failed child's raw stderr off the error; it is a Buffer here because the spawn always captures in
// `buffer` (see execFileHidden), so nothing has decoded it yet. Absent whenever stderr wasn't piped.
const readStderr = (error: Error): string =>
  "stderr" in error && Buffer.isBuffer(error.stderr) ? error.stderr.toString(getStderrEncoding(error.stderr)) : "";
// Run a sync child process capturing its stdout, hidden from the win32 console (see spawnHidden for why). Defaults the
// Near-universal `encoding: "utf8"` + `stdio: "pipe"` capture shape so probes only spell out what differs; windowsHide
// Is forced on. Returns stdout as a string.
//
// The spawn always captures in `buffer` and the streams are decoded here, one per stream, because Node's single
// `encoding` option decodes stdout and stderr alike — which silently destroys the failure message of any child that
// Writes them differently (wsl.exe answers a utf8 child's stdout with its OWN utf16le diagnostics). The wrapper
// Therefore raises an ExecFileError carrying stderr decoded by what that buffer's bytes show it to be, instead of
// Node's own error whose message concatenates the undecoded bytes.
export const execFileHidden = (
  file: string,
  args: readonly string[],
  { encoding = "utf8", input, stdio = "pipe", ...rest }: ExecFileHiddenOptions = {},
): string =>
  getResult(
    // Null whenever stdout wasn't piped (an "inherit" stdio streams it to the host terminal instead). stdin is encoded
    // Here rather than left to Node, which would encode a string `input` with the capture encoding — `buffer` — and
    // Reject it as an unknown encoding; the caller's `encoding` is what its text is really in.
    (): Buffer | null =>
      execFileSync(file, args, {
        ...rest,
        ...(input === undefined ? {} : { input: Buffer.from(input, encoding) }),
        encoding: "buffer",
        stdio,
        windowsHide: true,
      }),
  ).match(
    (stdout) => stdout?.toString(encoding) ?? "",
    (error) => {
      throw new ExecFileError(file, args, readStderr(error), error);
    },
  );
