import { MEGABYTE } from "#shared/services/app/constants";

// The largest file a pack keeps, in bytes: a release's textures run to a few megabytes, so this is far above any of them, and it bounds what one file can make the server read and hash
export const MAX_CHARACTER_PACK_FILE_SIZE = 32 * MEGABYTE;
// The most a pack keeps across its files, in bytes: a model with its textures runs to tens of megabytes
export const MAX_CHARACTER_PACK_SIZE = 256 * MEGABYTE;
// The most an account's packs keep together, in bytes, a file counted once for each pack that lists it
export const MAX_ACCOUNT_CHARACTER_PACKS_SIZE = 1024 * MEGABYTE;
// The most files a pack keeps, which bounds the list each request names
export const MAX_CHARACTER_PACK_FILE_COUNT = 256;
// A file's SHA-256 in hexadecimal, the name it is stored under
export const SHA256_REGEX = /^[\da-f]{64}$/u;
// A file is stored under its hash and never changes, so the browser keeps it for as long as it is served
export const CHARACTER_PACK_FILE_MAX_AGE_SECONDS = 31_536_000;
