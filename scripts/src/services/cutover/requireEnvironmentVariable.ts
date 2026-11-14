import { InvalidOperationError, Operation } from "@esposter/shared";

// A variable only one step reads, so the step that needs it names it, and the others never see it
export const requireEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new InvalidOperationError(Operation.Read, name, "is not set in the environment");
  return value;
};
