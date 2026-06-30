/* oxlint-disable no-inferrable-types */
import { describe } from "vitest";
// Shared fixtures for the heavy, host-gated acceptance tests (os-backend install + snapshot warm-fork), which
// Both install the real dependency closure into a RAM sandbox and then prove a native binary runs inside it.
// A `.test.ts` so ctix keeps these out of the public barrel.
// The dependency directory an install materialises — the snapshot lower in a fork, never flushed back to the host.
export const NODE_MODULES_DIRECTORY = "node_modules";
// The pnpm content-addressed modules directory inside an installed workspace — where the per-package bins live.
export const PNPM_MODULES_DIRECTORY = `${NODE_MODULES_DIRECTORY}/.pnpm`;
// Locate esbuild's native (Go) binary in the installed closure, then print its version — the proof that a real
// Native subprocess executes inside the sandbox. Split so a caller can interpose its own guards between them.
// The closure pins several esbuild versions, so the matches are sorted before taking the first: `find` emits in
// Raw readdir order, which is not stable across an overlayfs fork vs a tmpfs in-place install, and an unsorted
// `head -1` would let the equivalence differential pick a different (equally valid) version on each side.
export const FIND_ESBUILD_BINARY_COMMAND: string = `ESBUILD=$(find ${PNPM_MODULES_DIRECTORY} -path '*/bin/esbuild' -type f | LC_ALL=C sort | head -1)`;
export const RUN_ESBUILD_VERSION_COMMAND: string = `"$ESBUILD" --version`;
// Matches the dotted version esbuild prints (e.g. `0.21.5`), asserting the native binary actually ran.
export const ESBUILD_VERSION_REGEX: RegExp = /\d+\.\d+\.\d+/u;
// A real, frozen-lockfile install of the whole workspace corpus into a RAM overlay on a cold store routinely
// Runs past the smaller default caps on a slow host, so allow this long before failing.
export const ACCEPTANCE_TIMEOUT_MINUTES: number = 10;

describe.todo("constants");
