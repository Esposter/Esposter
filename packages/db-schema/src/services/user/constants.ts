// Auth ids are minted by the auth library: better-auth's own are 32 characters and the adapter before it used a
// UUID, so a UUID's length is the longest id any account or session here carries
export const AUTH_ID_MAX_LENGTH = 36;
// The prefix a person's data export archives are written under in the user assets bucket, which its lifecycle rule
// Deletes from
export const DATA_EXPORT_BLOB_PREFIX = "exports/";
// Seven days after an export is ready, which the bucket's lifecycle rule and the row's expiry both read
export const DATA_EXPORT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const STATUS_MESSAGE_MAX_LENGTH = 64;
export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_NAME_MAX_LENGTH = 100;
