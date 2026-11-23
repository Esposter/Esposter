import { InvalidOperationError, Operation } from "@esposter/shared";

// Refuses content whose digest is not the hash its name carries, naming the subject that failed. Every check of stored or
// Served bytes against their name goes through here, so the refusal reads the same wherever it is raised
export const assertContentAddress = (subject: string, hash: string, digest: string): void => {
  if (digest !== hash) throw new InvalidOperationError(Operation.Read, subject, "does not hash to its name");
};
