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
// End-to-end speed gate: native vs os backend on real monorepo commands.
// Opt-in: RUN_ACCEPTANCE_TESTS=1 pnpm bench --project @esposter/sandbox-runtime
const enabled = process.env.RUN_ACCEPTANCE_TESTS === "1" && isOsBackendSupported();
const native = createNativeBackend();
const repoRoot = enabled ? findRepoRoot() : "";
// Overlay the pnpm store so writes land in RAM; copy import because hardlinks can't cross into the overlay.
const store = enabled ? execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim() : "";
const osInstallOptions: ExecOptions = { cwd: "", network: true, overlayDirs: [store], stdio: "pipe" };
// Separate corpora so native's on-disk node_modules don't warm the os run.
const nativeCorpus = enabled ? createWorkspaceCorpus(repoRoot) : "";
const osCorpus = enabled ? createWorkspaceCorpus(repoRoot) : "";
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
