import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { formatCacheHitLabel } from "@/services/cli/cache/formatCacheHitLabel";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
// Printed before an os-backend run so the (sometimes minutes-long) one-time install is never a silent stall: the
// First run for a given lockfile installs the toolchain inside the sandbox, later runs reuse the frozen snapshot.
// Turbo-style hit/miss vocabulary — a `snapshot cache hit` is blue-bold (the fast route, emphasized) while a
// `snapshot cache miss` is yellowed (expect a wait), so the two outcomes read before the words do. Both lines carry
// Only the lockfile hash — the `snapshot cache hit` label already says the snapshot is being reused, so no restatement.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string => {
  const lockfile = colorize(hash.slice(0, 12), Color.Blue);
  return exists
    ? formatVirrunLine(`${formatCacheHitLabel("snapshot cache hit")} (lockfile ${lockfile})`)
    : formatVirrunLine(
        colorize(
          `snapshot cache miss (lockfile ${lockfile}) — installing toolchain once (may take minutes); later runs reuse it`,
          Color.Yellow,
        ),
      );
};
