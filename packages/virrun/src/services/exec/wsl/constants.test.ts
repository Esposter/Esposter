// oxlint-disable typescript/no-inferrable-types
import type { WslLoginEnvironment } from "#src/models/exec/wsl/WslLoginEnvironment";

import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { describe } from "vitest";

// The one login capture every suite that mocks `readWslLoginEnvironment` hands back. Non-empty by construction:
// `createOsExecOptions` treats an empty path on win32 as a *failed* capture and throws, so a suite mocking it empty
// Asserts that guard instead of its own subject — on win32 hosts only, which is why CI never saw it.
// Never mutated: two suites return this object itself from their mock factory, so emptying the path in place would
// Empty it for every later test in that file. A suite that needs the failed-capture path mocks its own holder and
// Empties that instead, exactly as the guard's own test does.
export const TEST_WSL_LOGIN_ENVIRONMENT: WslLoginEnvironment = {
  nodeVersion: "v26.5.0",
  path: "/usr/local/bin:/usr/bin",
};

export const TEST_REPO_ROOT_WIN: string = String.raw`C:\a`;
export const TEST_WSL_PREFIX = "/wsl/";
// A fake default distro + a secondary, so the `wsl.exe -l -q` default-first parse can be exercised, plus `$HOME`.
export const TEST_WSL_DISTRO = "a";
export const TEST_WSL_DISTRO_SECONDARY = "b";
export const TEST_WSL_HOME = "/a";
// Name of the in-temp dir the getWslNativeCacheRoot mock points at on win32 (joined under os.tmpdir() by the consumer).
export const TEST_WSL_CACHE_DIR_NAME = "a";
// `\\wsl.localhost` (and the legacy `\\wsl$`) UNC prefixes point straight at a distro's ext4 filesystem;
// `createTestWslUnc` joins the distro segment on (no trailing separator here — it would escape the backtick).
export const TEST_WSL_UNC_PREFIX: string = String.raw`\\wsl.localhost`;
export const TEST_WSL_LEGACY_UNC_PREFIX: string = String.raw`\\wsl$`;
// `/a/.virrun` — the virrun cache root on the distro's own ext4 (what readWslPath maps the UNC back to).
export const TEST_WSL_CACHE_ROOT_LINUX: string = `${TEST_WSL_HOME}/${VIRRUN_CACHE_DIRECTORY_NAME}`;
// `/a/store` — a second Linux path under the distro home, for the legacy-UNC mapping case.
export const TEST_WSL_STORE_LINUX: string = `${TEST_WSL_HOME}/${VIRRUN_STORE_DIRECTORY_NAME}`;

export const TEST_PNPM_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_PNPM_STORE_DIRECTORY_NAME}`;
export const TEST_COREPACK_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_COREPACK_STORE_DIRECTORY_NAME}`;

describe.todo("constants");
