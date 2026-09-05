// The pipeline package's own `RestError` rather than either SDK's re-export, for the reason checkIsConflict
// Gives
import { RestError } from "@azure/core-rest-pipeline";

// The row, blob or entity is genuinely absent — the one rejection a read may translate into an empty result.
// Every other fault (throttling, a socket reset, a malformed body) is a read that FAILED, which is a different
// Fact: reporting it as absence tells a caller the thing was deleted and lets it act on that
export const checkIsNotFound = (error: unknown): boolean => error instanceof RestError && error.statusCode === 404;
