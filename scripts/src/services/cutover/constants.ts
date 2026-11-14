// The purpose the archive bucket's name is built from, local to this tool so no shared bucket enum gains a member for it
export const CUTOVER_ARCHIVE_PURPOSE = "cutover-archive";
// Every checkpoint and snapshot object sits under one prefix, so the archive lists as its steps read
export const ARCHIVE_CHECKPOINT_PREFIX = "checkpoints";
export const ARCHIVE_SNAPSHOT_PREFIX = "snapshots";
// Live copies run this many objects or entities at a time: enough to hide a round trip, few enough to stay inside a
// container's throttle and a Worker-free machine's memory
export const COPY_CONCURRENCY = 16;
// A D1 statement takes at most this many bound parameters and this many bytes of SQL and values
export const D1_STATEMENT_PARAMETER_LIMIT = 100;
export const D1_STATEMENT_BYTE_LIMIT = 100 * 1024;
// A batch request carries this many statements, all applied in one transaction
export const D1_BATCH_STATEMENT_COUNT = 20;
export const DEFER_FOREIGN_KEYS_STATEMENT = "PRAGMA defer_foreign_keys = true";
export const KEYSET_PAGE_SIZE = 1000;
export const AZURE_PAGE_SIZE = 1000;
// A multipart part is buffered in memory before it is sent, so it is sized for that, and every part but the last is at
// least R2's five mebibyte minimum
export const R2_MULTIPART_PART_BYTES = 64 * 1024 * 1024;
// The FTS5 table over the messages' text, kept by triggers, so it holds one row per message
export const MESSAGES_SEARCH_TABLE_NAME = "messages_search";
// The temporary internal route on the functions Worker the reschedule step calls, and the header its secret travels in
export const RESCHEDULE_PATH = "/_internal/cutover/reschedule";
export const CUTOVER_SECRET_HEADER = "x-cutover-secret";
// The throughput the inventory's estimate assumes. The rehearsal measures the real rate, and the estimate says so
export const ESTIMATE_BYTES_PER_SECOND = 10 * 1024 * 1024;
export const ESTIMATE_ROWS_PER_SECOND = 2000;
export const MD5_ALGORITHM = "md5";
