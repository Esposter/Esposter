import type { StdioOptions } from "node:child_process";
// Options a virrun probe overrides on top of execFileHidden's capture defaults. A subset of Node's ExecFileSyncOptions:
// The fields callers actually vary (a utf16le distro list, a stdin `input`, a larger buffer, a bespoke stdio triple,
// A cwd, a timeout), plus `stderrEncoding` for a child whose two streams disagree (execWsl). Both encodings are
// BufferEncoding (never null) so the wrapper always returns a string.
export interface ExecFileHiddenOptions {
  readonly cwd?: string;
  readonly encoding?: BufferEncoding;
  readonly input?: string;
  readonly maxBuffer?: number;
  readonly stderrEncoding?: BufferEncoding;
  readonly stdio?: StdioOptions;
  readonly timeout?: number;
}
