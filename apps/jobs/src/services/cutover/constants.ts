// The temporary internal routes of the cutover, and the header their secret travels in. The cutover command
// (scripts/src/services/cutover/constants.ts) names the same strings; all three routes are deleted at teardown
export const RESCHEDULE_PATH = "/_internal/cutover/reschedule";
export const ROOM_IMPORT_PATH = "/_internal/cutover/room-import";
export const ROOM_SUMMARY_PATH = "/_internal/cutover/room-summary";
export const CUTOVER_SECRET_HEADER = "x-cutover-secret";
