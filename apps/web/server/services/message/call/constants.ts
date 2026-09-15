// A generated call session id can only collide with one already taken, so the insert is retried rather than
// Failed — bounded, because a run of collisions that long is a broken generator, not bad luck
export const MAX_CALL_SESSION_ID_ATTEMPTS = 3;
// Postgres `unique_violation`. The id is short enough to collide, so a duplicate key is the one failure that
// Means "try another id" — every other failure is the database itself, and retrying through it three times only
// Delays the report and dresses it up as an id-allocation problem
export const UNIQUE_VIOLATION_ERROR_CODE = "23505";
