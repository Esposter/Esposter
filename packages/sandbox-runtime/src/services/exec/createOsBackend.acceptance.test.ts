import { createOsBackend } from "@/services/exec/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
// Walks up from this file until the monorepo root (the dir holding pnpm-workspace.yaml) so the corpus
// Mirrors whatever checkout the test runs in, not a hard-coded path.
const findRepoRoot = (): string => {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("could not locate the monorepo root (no pnpm-workspace.yaml found)");
    dir = parent;
  }
  return dir;
};
// Assembles a manifest mirror of the real monorepo: symlinks the root manifests + every workspace
// package.json into a fresh dir with NO node_modules, so a real `pnpm install` resolves the actual
// Dependency closure from a clean cold state. Lives under $HOME (NOT os.tmpdir) because the sandbox
// Masks /tmp with --tmpfs, which would hide a /tmp corpus from the command running inside.
const buildCorpus = (repoRoot: string): string => {
  const cache = join(homedir(), ".cache");
  mkdirSync(cache, { recursive: true });
  const corpus = mkdtempSync(join(cache, "sandbox-corpus-"));
  for (const manifest of ["package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml"])
    symlinkSync(join(repoRoot, manifest), join(corpus, manifest));
  const packages = join(repoRoot, "packages");
  mkdirSync(join(corpus, "packages"));
  for (const name of readdirSync(packages)) {
    const packageJson = join(packages, name, "package.json");
    if (!existsSync(packageJson)) continue;
    mkdirSync(join(corpus, "packages", name));
    symlinkSync(packageJson, join(corpus, "packages", name, "package.json"));
  }
  return corpus;
};
// Heavy + networked + Linux-only, so opt-in: RUN_ACCEPTANCE_TESTS=1 pnpm test --project @esposter/sandbox-runtime
describe.skipIf(process.env.RUN_ACCEPTANCE_TESTS !== "1" || !isOsBackendSupported())(
  "createOsBackend — real workspace install (acceptance)",
  () => {
    let corpus = "";
    let store = "";
    beforeAll(() => {
      const repoRoot = findRepoRoot();
      corpus = buildCorpus(repoRoot);
      store = execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim();
    });
    afterAll(() => {
      if (corpus) rmSync(corpus, { force: true, recursive: true });
    });

    test("installs the real dependency closure fully in RAM, runs a native binary, and leaves the host untouched", async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();
      // The store is overlaid so pnpm's writable index lands in RAM; copy import is used because
      // Hardlinks can't cross from the on-disk store into the RAM overlay. The compound proves: the
      // Install (native pacquet binary + build scripts) succeeds, node_modules fully materialized in
      // RAM, and a native binary (esbuild's Go executable) actually runs inside the sandbox.
      const command = [
        "pnpm install --frozen-lockfile --config.package-import-method=copy",
        `test "$(find . -path '*/node_modules/*' -type f | wc -l)" -gt 100000`,
        "ESBUILD=$(find node_modules/.pnpm -path '*@esbuild+linux-x64*/bin/esbuild' -type f | head -1)",
        `"$ESBUILD" --version`,
        "echo SANDBOX_OK",
      ].join(" && ");
      const { exitCode, stdout } = await exec(command, {
        cwd: corpus,
        network: true,
        overlayDirs: [store],
        stdio: "pipe",
      });

      expect(exitCode).toBe(0);
      expect(stdout).toContain("SANDBOX_OK");
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
      // The subprocess wall held: nothing the install wrote reached the host corpus on disk.
      expect(existsSync(join(corpus, "node_modules"))).toBe(false);
    }, 180_000);
  },
);
