// Level 19 buys a marginally smaller delta for whole seconds on a multi-megabyte document, on a path a user is
// Waiting behind, and below 12 the ratio degrades sharply and non-monotonically because the lower levels give
// Up on exactly the long-range matches a near-duplicate document is made of. Shared by every zstd encoder a
// Document passes through — the version store's on the server and the browser's delta saves
export const DEFAULT_COMPRESSION_LEVEL = 12;
// Zstd's own bounds on a frame's window. The upper bound is 128 MiB, which is far past any document this
// Stores while staying inside what a decoder is willing to allocate
export const MIN_WINDOW_LOG = 10;
export const MAX_WINDOW_LOG = 27;
