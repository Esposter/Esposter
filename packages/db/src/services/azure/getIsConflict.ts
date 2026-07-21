import { RestError } from "@azure/storage-blob";

// The row, blob or entity already exists — the one rejection an idempotent create expects and absorbs,
// However it surfaces (a single insert, the transaction it was batched into, a conditional upload)
export const getIsConflict = (error: unknown): boolean => error instanceof RestError && error.statusCode === 409;
