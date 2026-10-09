// Whether the error is a path that does not exist, as a read of a missing file or a listing of a removed one reports
export const checkIsNotFound = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "ENOENT";
