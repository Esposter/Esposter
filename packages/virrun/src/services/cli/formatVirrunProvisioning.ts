import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// Printed before an os-backend run so the (sometimes minutes-long) one-time install is never a silent stall: the
// First run for a given lockfile installs the toolchain inside the sandbox, later runs reuse the frozen snapshot. The
// Warm-reuse line is dimmed (routine, fast) while the one-time-install line is yellowed (expect a wait) so the two
// Outcomes are distinguishable before reading the words.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string => {
  const lockfile = colorize(hash.slice(0, 12), Color.Blue);
  return exists
    ? formatVirrunLine(colorize(`reusing the sandbox dependency snapshot (lockfile ${lockfile})`, Color.Dim))
    : formatVirrunLine(
        colorize(
          `no sandbox dependency snapshot for lockfile ${lockfile} — installing the toolchain inside the sandbox once (this run may take a few minutes); later runs reuse it`,
          Color.Yellow,
        ),
      );
};
