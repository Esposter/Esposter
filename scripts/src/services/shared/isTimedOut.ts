// The error a spawn carries when its `timeout` killed the child, the one failure node gives the code `ETIMEDOUT`
export const isTimedOut = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "ETIMEDOUT";
