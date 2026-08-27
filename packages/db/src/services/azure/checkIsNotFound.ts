// Both `@azure/storage-blob` and `@azure/data-tables` re-export this one class from the pipeline package, and
// This check classifies errors from both — so it imports the original, for the same reason checkIsConflict does
import { RestError } from "@azure/core-rest-pipeline";

// The row, blob or entity is genuinely absent — the one rejection a read may translate into an empty result.
// Every other fault (throttling, a socket reset, a malformed body) is a read that FAILED, which is a different
// Fact: reporting it as absence tells a caller the thing was deleted and lets it act on that
export const checkIsNotFound = (error: unknown): boolean => error instanceof RestError && error.statusCode === 404;
