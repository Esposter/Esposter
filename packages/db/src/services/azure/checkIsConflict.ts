// Both `@azure/storage-blob` and `@azure/data-tables` re-export this one class from the pipeline package, and
// This check classifies errors from both — so it imports the original. Taking either SDK's re-export makes the
// `instanceof` depend on the two resolving one shared copy, and the day a version bump splits them the check
// Silently stops recognising the other SDK's conflicts
import { RestError } from "@azure/core-rest-pipeline";

// The row, blob or entity already exists — the one rejection an idempotent create expects and absorbs,
// However it surfaces (a single insert, the transaction it was batched into, a conditional upload)
export const checkIsConflict = (error: unknown): boolean => error instanceof RestError && error.statusCode === 409;
