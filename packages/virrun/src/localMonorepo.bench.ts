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
// End-to-end speed gate: native vs os backend on real monorepo commands. Each group is a native-vs-os
// Comparison, so the whole group is gated on isOsSupported — a host without overlayfs (Windows, some WSL2
// Builds) can't run the os side, and a native-only group is an incomplete comparison we don't want to emit.
const isOsSupported = isOsBackendSupported();
const native = createNativeBackend();
const repoRoot = isOsSupported ? findRepoRoot() : "";
// Overlay the pnpm store so writes land in RAM; copy import because hardlinks can't cross into the overlay.
const store = isOsSupported ? execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim() : "";
const osInstallOptions: ExecOptions = { cwd: "", isNetworkEnabled: true, overlayDirs: [store], stdio: "pipe" };
// Separate corpora so native's on-disk node_modules don't warm the os run.
const nativeCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const osCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const INSTALL = "pnpm install --frozen-lockfile --config.package-import-method=copy";
const cleanModules = "find . -name node_modules -type d -prune -exec rm -rf {} +";
// Clear caches before each run so neither side benefits from incremental state.
const SHARED = join(repoRoot, "packages/shared");
const cold = (clean: string, command: string): string => `${clean} 2>/dev/null; ${command}`;
const ITERATIONS = { iterations: 3, time: 0, warmupIterations: 0, warmupTime: 0 } as const;
const INSTALL_ITERATIONS = { iterations: 2, time: 0, warmupIterations: 0, warmupTime: 0 } as const;

afterAll(() => {
  for (const corpus of [nativeCorpus, osCorpus]) if (corpus) rmSync(corpus, { force: true, recursive: true });
});

describe.skipIf(!isOsSupported)("install — real workspace dependency closure (cold)", () => {
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

describe.skipIf(!isOsSupported)("typecheck — packages/shared (cold)", () => {
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

describe.skipIf(!isOsSupported)("build — packages/shared (cold)", () => {
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

describe.skipIf(!isOsSupported)("test — packages/shared", () => {
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
