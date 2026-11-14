// D1 names the constraint a write broke in its message, and Drizzle wraps that error with the statement as its own
// Message, so the cause chain is read down rather than the top error alone
export const checkIsUniqueViolation = (error: unknown): boolean =>
  error instanceof Error && (error.message.includes("UNIQUE constraint failed") || checkIsUniqueViolation(error.cause));
