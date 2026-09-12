import { getStderrEncoding } from "#src/services/exec/util/getStderrEncoding";
// Node hangs the failed child's raw stderr off the error; it is a Buffer here because the spawn always captures in
// `buffer` (see execFileHidden), so nothing has decoded it yet. Absent whenever stderr wasn't piped.
export const readExecFileStderr = (error: Error): string =>
  "stderr" in error && Buffer.isBuffer(error.stderr) ? error.stderr.toString(getStderrEncoding(error.stderr)) : "";
