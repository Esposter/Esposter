// The rejections a stream table write raises, named for what the caller must do about each: a create that finds its row
// already there, a write whose etag is no longer the stored one, and a write or read of a row that is not there
export class StreamTableError extends Error {
  readonly code: StreamTableErrorCode;

  constructor(code: StreamTableErrorCode) {
    super(`Stream table write failed: ${code}`);
    this.name = "StreamTableError";
    this.code = code;
  }
}

export type StreamTableErrorCode = "etagMismatch" | "exists" | "notFound";
