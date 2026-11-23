import { InvalidOperationError, Operation } from "@esposter/shared";

// Refuses content whose digest is not the hash its name carries, naming the subject that failed. Every check of the bytes a
// Hosted-asset read, verify, fill or parity download fetches or caches against its name goes through here, so the refusal
// Reads the same wherever those are raised
export const assertContentAddress = (subject: string, hash: string, digest: string): void => {
  if (digest !== hash) throw new InvalidOperationError(Operation.Read, subject, "does not hash to its name");
};
