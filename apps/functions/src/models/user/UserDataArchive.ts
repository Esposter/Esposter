import type { PassThrough } from "node:stream";

// The archive a data export is written into. Entries are added one at a time.
// The zip's bytes leave through `output` for the upload to read.
// An entry waits whenever `output` is full, so only a chunk is ever held beyond what the upload has taken.
export interface UserDataArchive {
  addEntry: (name: string, source: NodeJS.ReadableStream | Uint8Array) => Promise<void>;
  addJsonEntry: (name: string, value: unknown) => Promise<void>;
  end: () => void;
  output: PassThrough;
}
