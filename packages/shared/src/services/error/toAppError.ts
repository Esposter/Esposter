export const toAppError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  )
    return new Error((error as { message: string }).message, { cause: error });
  return new Error(String(error), { cause: error });
};
