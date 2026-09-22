// Postgres `unique_violation`. A generated id is short enough to collide, so a duplicate key is the one insert
// Failure that means "try another id" — every other failure is the database itself, and retrying through it only
// Delays the report and dresses it up as an id-allocation problem
export const UNIQUE_VIOLATION_ERROR_CODE = "23505";
