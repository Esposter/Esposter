import { UNIQUE_VIOLATION_ERROR_CODE } from "@@/server/services/db/constants";

// Drizzle reports a failed query as its own error with the driver's underneath it as `cause`, so the code is
// Read down the chain rather than off the top
export const checkIsUniqueViolation = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;
  else if ("code" in error && error.code === UNIQUE_VIOLATION_ERROR_CODE) return true;
  else return "cause" in error && checkIsUniqueViolation(error.cause);
};
