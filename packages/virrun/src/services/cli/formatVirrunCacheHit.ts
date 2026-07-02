import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatCacheHitLabel } from "@/services/cli/formatCacheHitLabel";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// Task-cache hit line, stderr-only — printed just before the recorded output is replayed so a hit is visibly distinct
// From a real run (the replayed streams are otherwise byte-identical). Brackets inside the banner/result pair like the
// Provisioning line. Accepts the same command shape persistWithCache holds (argv or a pre-joined string). `task cache
// Hit` shares the blue-bold fast-route emphasis with `snapshot cache hit` so both wins read identically.
export const formatVirrunCacheHit = (command: readonly string[] | string): string =>
  formatVirrunLine(
    `${formatCacheHitLabel("task cache hit")} — replaying "${colorize(typeof command === "string" ? command : command.join(" "), Color.Yellow)}"`,
  );
