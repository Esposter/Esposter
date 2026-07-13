import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Built once and shared between the save procedure and the client save-conflict surface so detection can never drift
export const staleContentVersionErrorMessage = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot save resource content with old content version",
).message;
