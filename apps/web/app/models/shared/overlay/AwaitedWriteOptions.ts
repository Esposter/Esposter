// A write the screen waits for. It has no entry and takes no key: its response is an arrival, and the version gate
// Orders the responses of two writes to one row
export interface AwaitedWriteOptions {
  onError?: (error: Error) => void;
}
