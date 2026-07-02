// Whether virrun's own stderr lines should carry ANSI color. Honors the de-facto standard env overrides first —
// NO_COLOR (any non-empty value) forces plain (https://no-color.org), FORCE_COLOR="0"/"false" explicitly disables,
// Any other non-empty FORCE_COLOR forces color on — then falls back to whether stderr is a real terminal. Empty-string
// Values are treated as "not set" so an inherited FORCE_COLOR= from a parent process is neutral, not a force-on.
// Gating on stderr (not stdout) because every virrun banner/result/doctor line is a stderr write, and it keeps the
// Child's stdout diffs byte-clean. Re-read per call so a short-lived CLI honors a late-set env without an import-time
// Snapshot; the check is a couple of property reads, so the cost is irrelevant.
export const isColorEnabled = (): boolean => {
  const { FORCE_COLOR, NO_COLOR } = process.env;
  if (NO_COLOR !== undefined && NO_COLOR !== "") return false;
  else if (FORCE_COLOR === "0" || FORCE_COLOR === "false") return false;
  else if (FORCE_COLOR !== undefined && FORCE_COLOR !== "") return true;
  else return process.stderr.isTTY;
};
