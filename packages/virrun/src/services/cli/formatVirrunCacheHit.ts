import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// Task-cache hit line, stderr-only — printed just before the recorded output is replayed so a hit is visibly distinct
// From a real run (the replayed streams are otherwise byte-identical). Brackets inside the banner/result pair like the
// Provisioning line. Accepts the same command shape persistWithCache holds (argv or a pre-joined string). "cache hit"
// Is greened so a fast replay is obviously not a fresh run at a glance.
export const formatVirrunCacheHit = (command: readonly string[] | string): string =>
  formatVirrunLine(
    `${colorize("cache hit", Color.Green)}, replaying "${colorize(typeof command === "string" ? command : command.join(" "), Color.Yellow)}"`,
  );
