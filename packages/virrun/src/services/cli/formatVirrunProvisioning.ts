import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatCacheHitLabel } from "@/services/cli/formatCacheHitLabel";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// Printed before an os-backend run so the (sometimes minutes-long) one-time install is never a silent stall: the
// First run for a given lockfile installs the toolchain inside the sandbox, later runs reuse the frozen snapshot.
// Turbo-style hit/miss vocabulary — a `snapshot cache hit` is blue-bold (the fast route, emphasized) while a
// `snapshot cache miss` is yellowed (expect a wait), so the two outcomes read before the words do.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string => {
  const lockfile = colorize(hash.slice(0, 12), Color.Blue);
  return exists
    ? formatVirrunLine(
        `${formatCacheHitLabel("snapshot cache hit")} — reusing dependency snapshot (lockfile ${lockfile})`,
      )
    : formatVirrunLine(
        colorize(
          `snapshot cache miss (lockfile ${lockfile}) — installing the toolchain inside the sandbox once; this run may take a few minutes, later runs reuse it`,
          Color.Yellow,
        ),
      );
};
