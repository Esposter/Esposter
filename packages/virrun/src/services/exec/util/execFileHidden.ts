import type { StdioOptions } from "node:child_process";

import { execFileSync } from "node:child_process";
// Options a virrun probe overrides on top of execFileHidden's capture defaults. A subset of Node's ExecFileSyncOptions:
// The fields callers actually vary (a utf16le distro list, a stdin `input`, a larger buffer, a bespoke stdio triple,
// A cwd, a timeout). encoding is BufferEncoding (never null) so the wrapper always returns a string.
interface ExecFileHiddenOptions {
  readonly cwd?: string;
  readonly encoding?: BufferEncoding;
  readonly input?: string;
  readonly maxBuffer?: number;
  readonly stdio?: StdioOptions;
  readonly timeout?: number;
}
// Run a sync child process capturing its stdout, hidden from the win32 console (see spawnHidden for why). Defaults the
// Near-universal `encoding: "utf8"` + `stdio: "pipe"` capture shape so probes only spell out what differs; windowsHide
// Is forced on. Returns stdout as a string.
export const execFileHidden = (
  file: string,
  args: readonly string[],
  { encoding = "utf8", stdio = "pipe", ...rest }: ExecFileHiddenOptions = {},
): string => execFileSync(file, args, { encoding, stdio, ...rest, windowsHide: true });
