import { getOutputEncoding } from "#src/services/exec/util/getOutputEncoding";

// Node hangs the failed child's raw output streams off the error; each is a Buffer here because the spawn always
// Captures in `buffer` (see execFileHidden), so nothing has decoded it yet. Absent whenever that stream wasn't piped.
export const readExecFileOutput = (error: Error, stream: "stderr" | "stdout"): string => {
  const output: unknown = Reflect.get(error, stream);
  return Buffer.isBuffer(output) ? output.toString(getOutputEncoding(output)) : "";
};
