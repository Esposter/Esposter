import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// The two key-listing tiers — warm snapshots and source-keyed prepare layers — report identically: the tier's path,
// Then either a dimmed "none" or the entry count followed by the keys themselves. One builder so the two can never
// Drift into reading differently for the same state.
export const formatKeyedTierLine = (label: string, path: string, keys: readonly string[]): string =>
  formatVirrunLine(
    keys.length === 0
      ? `${label} ${colorize(path, Color.Blue)} (${colorize("none", Color.Dim)})`
      : `${label} ${colorize(path, Color.Blue)} (${colorize(String(keys.length), Color.Blue)}): ${keys.join(", ")}`,
  );
