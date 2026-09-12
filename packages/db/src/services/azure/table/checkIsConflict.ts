import { RestError } from "@azure/core-rest-pipeline";

// The row, blob or entity already exists — the one rejection an idempotent create expects and absorbs,
// However it surfaces (a single insert, the transaction it was batched into, a conditional upload)
export const checkIsConflict = (error: unknown): boolean => error instanceof RestError && error.statusCode === 409;
