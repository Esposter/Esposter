import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";

// The corpus + snapshot cache live under $HOME/.cache (NOT os.tmpdir) because the sandbox masks /tmp with
// --tmpfs, hiding a /tmp corpus from the command running inside. A host that can otherwise run the sandbox
// May still mount $HOME read-only (e.g. the root `test:packages` sandbox), where every mkdtemp under .cache
// Throws EROFS. So the predicate proves the writable cache home alongside sandbox support + a toolchain
// Entrypoint, otherwise the acceptance test crashes in `beforeAll` instead of skipping. getResult turns the
// EROFS throw into false, per the project's no-try/catch convention.
const isCacheHomeWritable = (): boolean =>
  getResult(() => {
    const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
    mkdirSync(cache, { recursive: true });
    const dir = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    rmSync(dir, { force: true, recursive: true });
  }).match(
    () => true,
    () => false,
  );
// Heavy + networked acceptance gate, shared by the os-backend install and the snapshot warm-fork tests. Proves
// The host can set up the overlay sandbox, reach a package-manager entrypoint inside it, and write the cache
// Home those tests stage the corpus into. Lives in a `.test.ts` so ctix keeps it out of the public barrel.
export const isSandboxInstallSupported: boolean =
  isOsBackendSupported() &&
  getResult(() =>
    process.platform === "win32"
      ? execFileSync("wsl.exe", ["--exec", "sh", "-lc", "command -v node && node --version && corepack --version"], {
          stdio: "pipe",
        })
      : execFileSync("sh", ["-lc", "command -v pnpm"], { stdio: "pipe" }),
  ).match(
    () => true,
    () => false,
  ) &&
  isCacheHomeWritable();

describe.todo("isSandboxInstallSupported");
