// The purpose the archive bucket's name is built from, local to this tool so no shared bucket enum gains a member for it
export const CUTOVER_ARCHIVE_PURPOSE = "cutover-archive";
// Every checkpoint and snapshot object sits under one prefix, so the archive lists as its steps read
export const ARCHIVE_CHECKPOINT_PREFIX = "checkpoints";
export const ARCHIVE_SNAPSHOT_PREFIX = "snapshots";
// Live copies run this many objects or entities at a time. Sixteen opened new connections to R2's S3 endpoint faster
// Than it accepted them from one machine, and timed out connecting; four copied the develop estate without one
export const COPY_CONCURRENCY = 4;
// A request to R2 that never connected is sent again up to this many times in all. The codes are undici's and the
// System's for a connection that was never made, so no body was read and a resend repeats nothing
export const R2_CONNECT_ATTEMPTS = 4;
export const R2_CONNECT_ERROR_CODES: string[] = ["UND_ERR_CONNECT_TIMEOUT", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND"];
// A D1 statement takes at most this many bound parameters and this many bytes of SQL and values
export const D1_STATEMENT_PARAMETER_LIMIT = 100;
export const D1_STATEMENT_BYTE_LIMIT = 100 * 1024;
// A request to the Cloudflare API or the functions Worker, bounded longer than a script's own fetch since a batch or a route can run for minutes
export const CUTOVER_REQUEST_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// A batch request carries this many statements, all applied in one transaction
export const D1_BATCH_STATEMENT_COUNT = 20;
export const DEFER_FOREIGN_KEYS_STATEMENT = "PRAGMA defer_foreign_keys = true";
// The id map's stores that are not Azure tables: the Postgres rows' new ids, the invites' new codes, and the messages' numbers in their rooms
export const POSTGRES_ID_MAP_SCOPE = "postgres";
export const INVITE_CODE_SCOPE = "inviteCodes";
export const MESSAGE_NUMBER_SCOPE = "messageNumbers";
export const KEYSET_PAGE_SIZE = 1000;
export const AZURE_PAGE_SIZE = 1000;
// A multipart part is buffered in memory before it is sent, so it is sized for that.
// Every part but the last is at least R2's five mebibyte minimum
export const R2_MULTIPART_PART_BYTES = 64 * 1024 * 1024;
// The temporary internal routes on the functions Worker the cutover calls, and the header their secret travels in.
// The functions Worker names the same paths; all of them are deleted at teardown
export const RESCHEDULE_PATH = "/_internal/cutover/reschedule";
export const ROOM_IMPORT_PATH = "/_internal/cutover/room-import";
export const ROOM_SUMMARY_PATH = "/_internal/cutover/room-summary";
export const CUTOVER_SECRET_HEADER = "x-cutover-secret";
// The throughput the inventory's estimate assumes. The rehearsal measures the real rate, and the estimate says so
export const ESTIMATE_BYTES_PER_SECOND = 10 * 1024 * 1024;
export const ESTIMATE_ROWS_PER_SECOND = 2000;
export const MD5_ALGORITHM = "md5";
