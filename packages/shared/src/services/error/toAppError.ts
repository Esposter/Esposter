/* oxlint-disable error-handling/no-bare-error -- the boundary that turns an unknown throw into the plain `Error` other code wraps, so it has no operation or entity to name */
export const toAppError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  else if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string")
    return new Error(error.message, { cause: error });
  else return new Error(String(error), { cause: error });
};
