// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// Completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
// What a reverse-ticked timestamp is allowed to look like: the countdown is a BigInt subtraction rendered with
// `toString()`, so digits and nothing else — no sign, no separator, no empty string
export const REVERSE_TICKED_TIMESTAMP_REGEX = /^\d+$/u;
