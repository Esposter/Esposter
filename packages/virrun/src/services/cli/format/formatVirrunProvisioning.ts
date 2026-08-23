import { Color } from "#src/models/cli/Color";
import { formatCacheHitLabel } from "#src/services/cli/cache/formatCacheHitLabel";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Printed before an os-backend run so the (sometimes minutes-long) one-time install is never a silent stall: the
// First run for a given environment installs the toolchain inside the sandbox, later runs reuse the frozen snapshot.
// Turbo-style hit/miss vocabulary — a `snapshot cache hit` is blue-bold (the fast route, emphasized) while a
// `snapshot cache miss` is yellowed (expect a wait), so the two outcomes read before the words do. Both lines carry
// Only the environment key (the lockfile digest plus the sandbox node major, see computeEnvironmentKey) — the
// `snapshot cache hit` label already says the snapshot is being reused, so no restatement.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string => {
  const environment = colorize(hash.slice(0, 12), Color.Blue);
  return exists
    ? formatVirrunLine(`${formatCacheHitLabel("snapshot cache hit")} (environment ${environment})`)
    : formatVirrunLine(
        colorize(
          `snapshot cache miss (environment ${environment}) — installing toolchain once (may take minutes); later runs reuse it`,
          Color.Yellow,
        ),
      );
};
