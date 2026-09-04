export const AUDIO_RECORDER_TIMER_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
// A filename wants one stable sortable spelling for everyone, which is the opposite of what a localised
// <NuxtTime> renders, and hyphens rather than colons because Windows rejects a colon in a file name
export const AUDIO_MESSAGE_DATE_FORMAT = "YYYY-MM-DD HH-mm-ss";
