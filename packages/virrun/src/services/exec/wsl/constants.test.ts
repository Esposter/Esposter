// oxlint-disable typescript/no-inferrable-types
import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { describe } from "vitest";

export const TEST_REPO_ROOT_WIN: string = String.raw`C:\a`;
export const TEST_WSL_PREFIX = "/wsl/";
// A fake default distro + a secondary, so the `wsl.exe -l -q` default-first parse can be exercised, plus `$HOME`.
export const TEST_WSL_DISTRO = "a";
export const TEST_WSL_DISTRO_SECONDARY = "b";
export const TEST_WSL_HOME = "/a";
// Name of the in-temp dir the getWslNativeCacheRoot mock points at on win32 (joined under os.tmpdir() by the consumer).
export const TEST_WSL_CACHE_DIR_NAME = "a";
// `\\wsl.localhost` (and the legacy `\\wsl$`) UNC prefixes point straight at a distro's ext4 filesystem;
// CreateTestWslUnc joins the distro segment on (no trailing separator here — it would escape the backtick).
export const TEST_WSL_UNC_PREFIX: string = String.raw`\\wsl.localhost`;
export const TEST_WSL_LEGACY_UNC_PREFIX: string = String.raw`\\wsl$`;
// `/a/.virrun` — the virrun cache root on the distro's own ext4 (what readWslPath maps the UNC back to).
export const TEST_WSL_CACHE_ROOT_LINUX: string = `${TEST_WSL_HOME}/${VIRRUN_CACHE_DIRECTORY_NAME}`;
// `/a/store` — a second Linux path under the distro home, for the legacy-UNC mapping case.
export const TEST_WSL_STORE_LINUX: string = `${TEST_WSL_HOME}/${VIRRUN_STORE_DIRECTORY_NAME}`;

export const TEST_PNPM_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_PNPM_STORE_DIRECTORY_NAME}`;
export const TEST_COREPACK_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_COREPACK_STORE_DIRECTORY_NAME}`;

describe.todo("constants");
