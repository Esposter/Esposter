// The pipeline package's own `RestError` rather than either SDK's re-export, for the reason checkIsConflict
// Gives
import { RestError } from "@azure/core-rest-pipeline";

// A conditional write lost its race: the `ifMatch` etag the caller read is no longer the one stored, because
// Something wrote in between. The one rejection a claim expects and absorbs — it means another writer owns the
// Work, not that the work failed
export const checkIsPreconditionFailed = (error: unknown): boolean =>
  error instanceof RestError && error.statusCode === 412;
