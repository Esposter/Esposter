// Printed before an os-backend run so the (sometimes minutes-long) one-time install is never a silent stall: the
// First run for a given lockfile installs the toolchain inside the sandbox, later runs reuse the frozen snapshot.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string =>
  exists
    ? `[virrun] reusing the sandbox dependency snapshot (lockfile ${hash.slice(0, 12)})`
    : `[virrun] no sandbox dependency snapshot for lockfile ${hash.slice(0, 12)} — installing the toolchain inside the sandbox once (this run may take a few minutes); later runs reuse it`;
