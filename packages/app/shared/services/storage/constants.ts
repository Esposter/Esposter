// A write SAS carries no length constraint — Azure offers no such option — and the PUT never passes back
// Through Nitro, so MAX_FILE_REQUEST_SIZE bounds the declaration and not the payload: one under-declared upload
// Overshoots by however much the client sends, until BlobCreated charges its real size. What this caps is how
// Many such uploads a user may have in flight at once — without it a tiny declaration buys unlimited holds.
export const MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES = 64;

export const storageQuotaExceededErrorMessage = "You have run out of storage.";

// Where the usage bar stops being informational and starts being a warning. Percentages rather than byte
// Thresholds so they hold for every tier.
export const STORAGE_USAGE_WARNING_PERCENTAGE = 75;
export const STORAGE_USAGE_ERROR_PERCENTAGE = 90;
