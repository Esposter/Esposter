// Reconnecting backs off from the first delay to the cap and stays there, so a host that is down is retried for as
// Long as the page is open and costs nothing while it is
export const MIN_RECONNECT_DELAY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const MAX_RECONNECT_DELAY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
// How close to automatic compaction the context gauge starts warning, as a share of the compaction threshold
export const CONTEXT_WARNING_RATIO = 0.9;
export const MAIN_LANE_TITLE = "Main agent";
// A token count at the precision a gauge is read at — 30.3K of 1M rather than every digit
export const TOKEN_COUNT_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, notation: "compact" });
