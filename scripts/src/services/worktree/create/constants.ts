// The scripts package every worktree's `ai:` commands run from, so its closure is installed whatever packages are named
export const SCRIPTS_PACKAGE_NAME = "@esposter/scripts";
// The packages the scripts package imports at run time through their built `dist`, so they are built in every worktree
// Before its first command; the packages named on the command line are built beside them
export const RUNTIME_PACKAGE_DIRECTORIES: readonly string[] = ["configuration", "shared", "shared-node"];
// The install keeps the lockfile as committed, and the offline one after it settles the state the frozen one leaves
export const INSTALL_FROZEN_ARGUMENTS: readonly string[] = ["i", "--frozen-lockfile", "--prefer-offline"];
export const INSTALL_OFFLINE_ARGUMENTS: readonly string[] = ["i", "--offline"];
// A folder and a branch take the name, so it is kept to the lowercase characters a branch and a folder both allow
export const WORKTREE_NAME_REGEX = /^[\da-z][\da-z-]*$/u;
// The memory gate is waited on for this long, sampled every poll, before the command gives up and creates nothing
export const MEMORY_GATE_WAIT_MILLISECONDS: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
export const MEMORY_GATE_POLL_MILLISECONDS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
