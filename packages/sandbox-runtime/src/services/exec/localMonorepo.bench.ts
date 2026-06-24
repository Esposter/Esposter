import type { ExecOptions } from "@/models/exec/ExecOptions";

import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { createWorkspaceCorpus } from "@/services/exec/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/findRepoRoot.test";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// The speed gate, run against this monorepo's own real commands (no fabricated fixture). Heavy +
// Networked + Linux-only, so it is opt-in behind RUN_ACCEPTANCE_TESTS to keep the default `pnpm bench`
// Fast:
//   RUN_ACCEPTANCE_TESTS=1 pnpm bench --project @esposter/sandbox-runtime
// Honest framing (see specs/benchmarking.md): the `os` backend is expected to LOSE on these cold
// Single runs — bwrap pays namespace + overlay setup, and the on-disk store can't be hardlinked into
// The RAM overlay so install must copy. The win is structural and lands later: a warm-fork that pays
// Install once and forks the frozen RAM state for near-free repeated runs. This file establishes the
// Honest baseline that win must beat. Both sides reach the SAME observable state (a cold, clean run);
// Native does so on real disk, os in RAM.
const enabled = process.env.RUN_ACCEPTANCE_TESTS === "1" && isOsBackendSupported();
const native = createNativeBackend();
const repoRoot = enabled ? findRepoRoot() : "";
// The pnpm store is overlaid so its writable index lands in RAM; copy import because hardlinks can't
// Cross from the on-disk store into the RAM overlay. Network is on for the registry + supply-chain check.
const store = enabled ? execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim() : "";
const osInstallOptions: ExecOptions = { cwd: "", network: true, overlayDirs: [store], stdio: "pipe" };
// Separate corpora: native's install leaves node_modules on disk, which would warm the os run if it
// Shared the same overlay lower. The os corpus stays pristine because os writes only to RAM.
const nativeCorpus = enabled ? createWorkspaceCorpus(repoRoot) : "";
const osCorpus = enabled ? createWorkspaceCorpus(repoRoot) : "";
const INSTALL = "pnpm install --frozen-lockfile --config.package-import-method=copy";
const cleanModules = "find . -name node_modules -type d -prune -exec rm -rf {} +";
// One package stands in for the per-package dev loop. A leading cache-clear makes every run cold: on
// Native it removes the real artifact; inside the sandbox it whites the lower out in the RAM upper,
// So neither side benefits from a previous run's incremental cache.
const SHARED = join(repoRoot, "packages/shared");
const cold = (clean: string, command: string): string => `${clean} 2>/dev/null; ${command}`;
const ITERATIONS = { iterations: 3, time: 0, warmupIterations: 0, warmupTime: 0 } as const;
const INSTALL_ITERATIONS = { iterations: 2, time: 0, warmupIterations: 0, warmupTime: 0 } as const;

afterAll(() => {
  for (const corpus of [nativeCorpus, osCorpus]) if (corpus) rmSync(corpus, { force: true, recursive: true });
});

describe.skipIf(!enabled)("install — real workspace dependency closure (cold)", () => {
  bench(
    "native",
    async () => {
      await native.exec(`${cleanModules}; ${INSTALL}`, { cwd: nativeCorpus, stdio: "pipe" });
    },
    INSTALL_ITERATIONS,
  );

  bench(
    "os",
    async () => {
      await createOsBackend().exec(INSTALL, { ...osInstallOptions, cwd: osCorpus });
    },
    INSTALL_ITERATIONS,
  );
});

describe.skipIf(!enabled)("typecheck — packages/shared (cold)", () => {
  const command = cold("rm -f *.tsbuildinfo", "pnpm typecheck");
  bench(
    "native",
    async () => {
      await native.exec(command, { cwd: SHARED, stdio: "pipe" });
    },
    ITERATIONS,
  );

  bench(
    "os",
    async () => {
      await createOsBackend().exec(command, { cwd: SHARED, overlayDirs: [store], stdio: "pipe" });
    },
    ITERATIONS,
  );
});

describe.skipIf(!enabled)("build — packages/shared (cold)", () => {
  const command = cold("rm -rf dist *.tsbuildinfo", "pnpm build");
  bench(
    "native",
    async () => {
      await native.exec(command, { cwd: SHARED, stdio: "pipe" });
    },
    ITERATIONS,
  );

  bench(
    "os",
    async () => {
      await createOsBackend().exec(command, { cwd: SHARED, overlayDirs: [store], stdio: "pipe" });
    },
    ITERATIONS,
  );
});

describe.skipIf(!enabled)("test — packages/shared", () => {
  const command = "pnpm test --run";
  bench(
    "native",
    async () => {
      await native.exec(command, { cwd: SHARED, stdio: "pipe" });
    },
    ITERATIONS,
  );

  bench(
    "os",
    async () => {
      await createOsBackend().exec(command, { cwd: SHARED, overlayDirs: [store], stdio: "pipe" });
    },
    ITERATIONS,
  );
});
