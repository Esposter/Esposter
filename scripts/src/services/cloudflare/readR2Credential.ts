import { InvalidOperationError, Operation } from "@esposter/shared";

// A credential the R2 client reads from the environment when it is made, so a command that needs it fails on the first
// Missing one rather than on the first request
export const readR2Credential = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new InvalidOperationError(Operation.Read, name, "is not set in the environment");
  return value;
};
