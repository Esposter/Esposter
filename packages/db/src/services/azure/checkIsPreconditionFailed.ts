// Both `@azure/storage-blob` and `@azure/data-tables` re-export this one class from the pipeline package, and
// This check classifies errors from both — so it imports the original, for the same reason checkIsConflict does
import { RestError } from "@azure/core-rest-pipeline";

// A conditional write lost its race: the `ifMatch` etag the caller read is no longer the one stored, because
// Something wrote in between. The one rejection a claim expects and absorbs — it means another writer owns the
// Work, not that the work failed
export const checkIsPreconditionFailed = (error: unknown): boolean =>
  error instanceof RestError && error.statusCode === 412;
