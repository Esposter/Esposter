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

export const TEST_PNPM_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_PNPM_STORE_DIRECTORY_NAME}`;
export const TEST_COREPACK_STORE_PATH_WIN: string = `${TEST_REPO_ROOT_WIN}\\${VIRRUN_CACHE_DIRECTORY_NAME}\\${VIRRUN_STORE_DIRECTORY_NAME}\\${VIRRUN_COREPACK_STORE_DIRECTORY_NAME}`;

describe.todo("constants");
