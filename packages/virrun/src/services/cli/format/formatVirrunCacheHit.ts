import { Color } from "#src/models/cli/Color";
import { formatCacheHitLabel } from "#src/services/cli/cache/formatCacheHitLabel";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Task-cache hit line, stderr-only — printed just before the recorded output is replayed so a hit is visibly distinct
// From a real run (the replayed streams are otherwise byte-identical). Brackets inside the banner/result pair like the
// Provisioning line. Accepts the same command shape persistWithCache holds (argv or a pre-joined string). `task cache
// Hit` shares the blue-bold fast-route emphasis with `snapshot cache hit` so both wins read identically.
export const formatVirrunCacheHit = (command: readonly string[] | string): string =>
  formatVirrunLine(
    `${formatCacheHitLabel("task cache hit")} — replaying "${colorize(typeof command === "string" ? command : command.join(" "), Color.Yellow)}"`,
  );
