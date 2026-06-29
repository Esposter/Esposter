// The stderr line the CLI prints before an os-backend run, so the (sometimes minutes-long) one-time dependency
// Install is never a silent stall. The os backend runs every command over a frozen dep snapshot keyed by the
// Lockfile hash; we can't tell from outside whether a package needs a sandbox-platform binary the host lacks, so
// The first run for a given lockfile always installs the toolchain inside the sandbox and later runs reuse it.
// This line says which of those two is happening. Stderr-only and CLI-only, like the banner/result lines.
export const formatVirrunProvisioning = ({ exists, hash }: { exists: boolean; hash: string }): string =>
  exists
    ? `[virrun] reusing the sandbox dependency snapshot (lockfile ${hash.slice(0, 12)})`
    : `[virrun] no sandbox dependency snapshot for lockfile ${hash.slice(0, 12)} — installing the toolchain inside the sandbox once (this run may take a few minutes); later runs reuse it`;
