// A write SAS carries no length constraint and the PUT never passes back through Nitro, so a client that
// Under-declares overshoots its own quota until the settle sweep reads the blob's real size back. Each hold is
// Bounded by MAX_FILE_REQUEST_SIZE, so capping how many a user may hold at once is what bounds the overshoot to
// MAX_UNRECONCILED_STORAGE_BLOBS x MAX_FILE_REQUEST_SIZE — without it a tiny declaration buys unlimited holds.
export const MAX_UNRECONCILED_STORAGE_BLOBS = 64;

export const storageQuotaExceededErrorMessage = "You have run out of storage.";

// Where the usage bar stops being informational and starts being a warning. Percentages rather than byte
// Thresholds so they hold for every tier.
export const STORAGE_USAGE_WARNING_PERCENTAGE = 75;
export const STORAGE_USAGE_ERROR_PERCENTAGE = 90;
