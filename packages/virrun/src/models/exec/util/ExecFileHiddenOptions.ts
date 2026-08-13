import type { StdioOptions } from "node:child_process";
// Options a virrun probe overrides on top of execFileHidden's capture defaults. A subset of Node's ExecFileSyncOptions:
// The fields callers actually vary (a utf16le distro list, a stdin `input`, a larger buffer, a bespoke stdio triple,
// A cwd, a timeout). `encoding` covers stdout only — a stderr encoding is never declared here because execFileHidden
// Detects it per failure. BufferEncoding (never null) so the wrapper always returns a string.
export interface ExecFileHiddenOptions {
  readonly cwd?: string;
  readonly encoding?: BufferEncoding;
  readonly input?: string;
  readonly maxBuffer?: number;
  readonly stdio?: StdioOptions;
  readonly timeout?: number;
}
