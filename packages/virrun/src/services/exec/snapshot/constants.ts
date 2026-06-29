/* oxlint-disable no-inferrable-types */
export const VIRRUN_SNAPSHOTS_DIRECTORY_NAME = "snapshots";
// Overlayfs layer names of a captured snapshot, under .virrun/snapshots/<lockfile-hash>/: `upper` is the
// Published layer that persists the post-install writes (and doubles as a read-only lower when forking);
// `work` is the empty scratch dir overlayfs requires alongside a writable upper. A capture run writes into
// Per-pid temps (`<name>.<pid>.tmp`) and renames the upper onto its final name as the atomic publish barrier.
export const VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME = "upper";
export const VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME = "work";
// The command captured into the warm snapshot to provision the sandbox's own dependency closure: a frozen
// Install of the lockfile. On Windows the sandbox is a Linux (WSL) guest installing via corepack's pnpm
// (the login PATH brings node + corepack, not necessarily a global pnpm); on Linux the caller's shell
// Already exposes pnpm, so it is invoked directly. See resolveSetupCommand.
export const SETUP_COMMAND_WIN32 = "corepack pnpm install --frozen-lockfile";
export const SETUP_COMMAND_LINUX = "pnpm install --frozen-lockfile";
