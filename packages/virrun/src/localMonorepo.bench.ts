import type { ExecOptions } from "@/models/exec/ExecOptions";

import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { OS_BACKEND_BENCH_TASK_NAME } from "@/services/exec/constants.bench";
import { createWorkspaceCorpus } from "@/services/exec/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/findRepoRoot.test";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// End-to-end speed gate: native vs os backend on real monorepo commands. Each group is a native-vs-os
// Comparison, so the whole group is gated on direct Linux support — a WSL host can benchmark the core
// Backend in createOsBackend.bench.ts, but this macro path needs the full Linux package-manager toolchain.
const isOsSupported = process.platform === "linux" && isOsBackendSupported();
const native = createNativeBackend();
const repoRoot = isOsSupported ? findRepoRoot() : "";
// Bind the warm global pnpm store writable into the os sandbox (the shipped store mechanism) so it reuses
// Downloads like native does; copy import because hardlinks can't cross from the on-disk store into the overlay.
const store = isOsSupported ? execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim() : "";
const osInstallOptions: ExecOptions = {
  bindDirs: [store],
  cwd: "",
  env: {
    PNPM_CONFIG_PACKAGE_IMPORT_METHOD: "copy",
    PNPM_CONFIG_STORE_DIR: store,
  },
  isNetworkEnabled: true,
  stdio: "pipe",
};
// Separate corpora so native's on-disk node_modules don't warm the os run.
const nativeCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const osCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const INSTALL = "pnpm install --frozen-lockfile --config.package-import-method=copy";
const cleanModules = "find . -name node_modules -type d -prune -exec rm -rf {} +";
// Clear caches before each run so neither side benefits from incremental state.
const SHARED = join(repoRoot, "packages/shared");
const cold = (clean: string, command: string): string => `${clean} 2>/dev/null; ${command}`;

afterAll(() => {
  for (const corpus of [nativeCorpus, osCorpus]) if (corpus) rmSync(corpus, { force: true, recursive: true });
});

describe.skipIf(!isOsSupported)("install — real workspace dependency closure (cold)", () => {
  bench("native", async () => {
    await native.exec(`${cleanModules}; ${INSTALL}`, { cwd: nativeCorpus, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    await createOsBackend().exec(INSTALL, { ...osInstallOptions, cwd: osCorpus });
  });
});

describe.skipIf(!isOsSupported)("typecheck — packages/shared (cold)", () => {
  const command = cold("rm -f *.tsbuildinfo", "pnpm typecheck");
  bench("native", async () => {
    await native.exec(command, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    await createOsBackend().exec(command, { cwd: SHARED, stdio: "pipe" });
  });
});

describe.skipIf(!isOsSupported)("build — packages/shared (cold)", () => {
  const command = cold("rm -rf dist *.tsbuildinfo", "pnpm build");
  bench("native", async () => {
    await native.exec(command, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    await createOsBackend().exec(command, { cwd: SHARED, stdio: "pipe" });
  });
});

describe.skipIf(!isOsSupported)("test — packages/shared", () => {
  const command = "pnpm test --run";
  bench("native", async () => {
    await native.exec(command, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_BACKEND_BENCH_TASK_NAME, async () => {
    await createOsBackend().exec(command, { cwd: SHARED, stdio: "pipe" });
  });
});
