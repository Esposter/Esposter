import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";
import type { Virrun } from "@/models/virrun/Virrun";
import type { VirrunOptions } from "@/models/virrun/VirrunOptions";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import {
  COREPACK_HOME_KEY,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_ENV_KEY,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { readWslLoginPath } from "@/services/exec/wsl/readWslLoginPath";
import { loadSource } from "@/services/source/loadSource";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
// Maps each backend choice to its factory. Adding the future `os` backend is a one-line entry here
// Nothing else in the orchestrator changes. "auto" resolves to native until vfs beats it on the gates.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint. Resolves the source to a working directory, picks a backend, and hands
// Back a handle whose exec routes every command through it. dispose() tears down any temp state the
// Source created. Today the backend is native passthrough, so the sandbox is still a thin wrapper
// But it is the seam dogfooding and the gate harnesses are built against from day one.
export const createVirrun = async ({
  backend = BackendType.Auto,
  source = { dir: "", type: SourceType.Dir },
}: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const execBackend = backendFactories[backend]();
  const { cwd, dispose } = await loadSource(source);
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store
  // (bindDirs/PNPM_CONFIG_*) must still be injected, otherwise the os path runs without its host cache.
  const isOsBackend = execBackend.name === BackendType.Os;
  const sharedPackageStoreOptions: Pick<ExecOptions, "bindDirs" | "env"> = isOsBackend
    ? createSharedPackageStoreOptions(cwd)
    : {};
  // The os backend's WSL bridge runs commands through `wsl.exe --exec`, which skips the login + rc files, so a
  // Profile-bound node manager's node is off PATH. Capture the PATH a real WSL login+interactive shell sees
  // (where the user's version manager already activates) and inject it as PATH into every os-backend command —
  // Applied identically to the real backend and the differential baseline, so correctness diffs stay valid.
  // Linux needs none of this: there virrun already runs in the caller's shell env, so node is inherited. ""
  // (capture failed, or no win32 os backend) injects nothing, leaving the default PATH untouched.
  const wslLoginPath = isOsBackend && process.platform === "win32" ? readWslLoginPath() : "";
  // Inject the vitest-style presence signal (VIRRUN_ENV_KEY) into every command virrun runs, merged over any
  // Store env the os backend needs. Both the native backend and the bwrap sandbox apply options.env to the
  // Child, so the command — and its tests/config/tooling — can detect it runs under virrun via process.env.
  //
  // Re-enable network for the os backend (`--unshare-all` drops it): the os backend's guarantee is *filesystem*
  // Isolation, not network isolation (specs/exec-isolation.md → "deps download once"). Without it pnpm cannot
  // Reach the registry to bootstrap its config dependencies/deps, so every `virrun -- pnpm …` dies with
  // "fetch failed" before the real command runs — the typecheck/lint output never appears and CI fails opaquely.
  const toOptions = (stdio: ExecStdio): ExecOptions => ({
    ...sharedPackageStoreOptions,
    cwd,
    env: {
      ...(wslLoginPath === "" ? {} : { PATH: wslLoginPath }),
      ...sharedPackageStoreOptions.env,
      [VIRRUN_ENV_KEY]: "true",
    },
    isNetworkEnabled: isOsBackend,
    stdio,
  });
  // The capture run that provisions the sandbox dep closure needs corepack's home writable on a stable path, so
  // The WSL `corepack pnpm` bootstrap (and the pnpm it downloads) persists into the snapshot instead of vanishing
  // In the tmpfs upper. Bound and pointed at the repo store, beside the pnpm store, so it is reused across runs.
  const toInstallOptions = (stdio: ExecStdio): ExecOptions => {
    const options = toOptions(stdio);
    const corepackHome = join(
      getRepoCacheDirectory(cwd),
      VIRRUN_STORE_DIRECTORY_NAME,
      VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
    );
    mkdirSync(corepackHome, { recursive: true });
    return {
      ...options,
      bindDirs: [...(options.bindDirs ?? []), corepackHome],
      env: { ...options.env, [COREPACK_HOME_KEY]: corepackHome },
    };
  };
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Fork is the os backend's overlay-snapshot mechanism; other backends have no snapshot layer, so the
      // Transparent fallback is a plain exec — fork is then identical to exec with no warm reuse.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // The os backend is a Linux sandbox. We cannot tell from outside whether any dependency ships a
      // Platform-specific binary, and on a Windows host the host's win32 node_modules can't run inside it — so
      // Always provision the sandbox's own dep closure once, frozen into a lockfile-hash-keyed snapshot, then run
      // The command over it. Cold: capture the frozen install (its node_modules persist into the upper). Warm:
      // Reuse it. Either way `command` runs over a populated dep tree via forkSnapshot, never the bare source.
      if (!resolveSnapshotLocation(cwd).exists)
        await createSnapshot(execBackend, resolveSetupCommand(), toInstallOptions(stdio));
      return forkSnapshot(execBackend, command, toOptions(stdio));
    },
  };
};
