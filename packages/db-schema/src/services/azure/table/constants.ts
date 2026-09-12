// The origin every reverse-ticked timestamp counts down from. It is wider than any nanosecond timestamp so the
// Countdown never goes negative — Azure Table rejects a negative partition or row key outright
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
// What a reverse-ticked timestamp is allowed to look like: the countdown is a BigInt subtraction rendered with
// `toString()`, so digits and nothing else — no sign, no separator, no empty string
export const REVERSE_TICKED_TIMESTAMP_REGEX = /^\d+$/u;
