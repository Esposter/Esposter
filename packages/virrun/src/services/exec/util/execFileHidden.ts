import type { ExecFileHiddenOptions } from "@/models/exec/util/ExecFileHiddenOptions";

import { ExecFileError } from "@/models/exec/util/ExecFileError";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Node hangs the failed child's raw stderr off the error; it is a Buffer here because the spawn always captures in
// `buffer` (see execFileHidden), so nothing has decoded it yet. Absent whenever stderr wasn't piped.
const readStderr = (error: Error, stderrEncoding: BufferEncoding): string =>
  "stderr" in error && Buffer.isBuffer(error.stderr) ? error.stderr.toString(stderrEncoding) : "";
// Run a sync child process capturing its stdout, hidden from the win32 console (see spawnHidden for why). Defaults the
// Near-universal `encoding: "utf8"` + `stdio: "pipe"` capture shape so probes only spell out what differs; windowsHide
// Is forced on. Returns stdout as a string.
//
// The spawn always captures in `buffer` and the streams are decoded here, one encoding each, because Node's single
// `encoding` option decodes stdout and stderr alike — which silently destroys the failure message of any child that
// Writes them differently. The wrapper therefore raises an ExecFileError carrying stderr decoded with
// `stderrEncoding`, instead of Node's own error whose message concatenates the undecoded bytes.
export const execFileHidden = (
  file: string,
  args: readonly string[],
  { encoding = "utf8", stderrEncoding = encoding, stdio = "pipe", ...rest }: ExecFileHiddenOptions = {},
): string =>
  getResult(
    // Null whenever stdout wasn't piped (an "inherit" stdio streams it to the host terminal instead).
    (): Buffer | null => execFileSync(file, args, { ...rest, encoding: "buffer", stdio, windowsHide: true }),
  ).match(
    (stdout) => stdout?.toString(encoding) ?? "",
    (error) => {
      throw new ExecFileError(file, args, readStderr(error, stderrEncoding), error);
    },
  );
