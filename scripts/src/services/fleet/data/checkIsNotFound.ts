// Whether the error is a path that no longer exists, which a listing hits when another process removes it mid-walk
export const checkIsNotFound = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "ENOENT";
