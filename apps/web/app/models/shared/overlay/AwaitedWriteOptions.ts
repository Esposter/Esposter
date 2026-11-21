import type { AwaitedReason } from "#src/models/shared/AwaitedReason";

// A write the screen waits for. It has no entry and takes no key: its response is an arrival, and the version gate
// Orders the responses of two writes to one row. It names why the screen waits, the same closed set the awaited form
// Of executeMutation takes, so a write that waits for no reason the server alone can answer is refused
export interface AwaitedWriteOptions {
  awaitedBecause: AwaitedReason;
  onError?: (error: Error) => void;
}
