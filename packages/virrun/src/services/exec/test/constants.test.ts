/* oxlint-disable typescript/no-inferrable-types */
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { describe } from "vitest";
// A pid far above any real one, so the OS reports no such process (ESRCH) — the shared "this owner is dead" sentinel
// Every lease/temp reaping test seeds a hard-killed run's corpse with (process.pid is the live-runner counterpart).
export const DEAD_PID: number = 2 ** 30;
// A valid, in-range pid the parse helpers read back out of a temp/lease name.
export const PID = 0;
// Shared fixtures for the heavy, host-gated acceptance tests (os-backend install + snapshot warm-fork).
// `pnpm install` materialises a per-package node_modules under each child, so every `packages/<pkg>` becomes a
// Snapshot-lower path even though it is real source the flush must keep.
export const PACKAGES_DIRECTORY = "packages";
export const PNPM_MODULES_DIRECTORY: string = `${NODE_MODULES_DIRECTORY}/.pnpm`;
// Locate esbuild's native binary then print its version — the proof a native subprocess runs inside the sandbox.
// Matches are sorted before taking the first: `find` emits in raw readdir order, not stable across an overlayfs
// Fork vs a tmpfs in-place install, so an unsorted `head -1` could pick a different version on each side.
export const FIND_ESBUILD_BINARY_COMMAND: string = `ESBUILD=$(find ${PNPM_MODULES_DIRECTORY} -path '*/bin/esbuild' -type f | LC_ALL=C sort | head -1)`;
export const RUN_ESBUILD_VERSION_COMMAND: string = `"$ESBUILD" --version`;
export const ESBUILD_VERSION_REGEX: RegExp = /\d+\.\d+\.\d+/u;
// A frozen install of the whole corpus into a RAM overlay on a cold store routinely runs past the default caps.
export const ACCEPTANCE_TIMEOUT_MINUTES: number = 10;

describe.todo("constants");
