import type { ExecFileHiddenOptions } from "#src/models/exec/util/ExecFileHiddenOptions";

import { ExecFileError } from "#src/models/exec/util/ExecFileError";
import { readExecFileStderr } from "#src/services/exec/util/readExecFileStderr";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
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
      throw new ExecFileError(file, args, readExecFileStderr(error), error);
    },
  );
