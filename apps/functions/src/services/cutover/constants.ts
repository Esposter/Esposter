// The temporary route the cutover calls to schedule the copied jobs, and the header its secret travels in. The cutover
// command (scripts/src/services/cutover/constants.ts) names the same two strings; both are deleted at teardown
export const RESCHEDULE_PATH = "/_internal/cutover/reschedule";
export const CUTOVER_SECRET_HEADER = "x-cutover-secret";
