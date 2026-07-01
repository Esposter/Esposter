export const toAppError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  else if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string")
    return new Error(error.message, { cause: error });
  else return new Error(String(error), { cause: error });
};
