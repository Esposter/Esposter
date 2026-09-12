import { HOME_CACHE_DIRECTORY_NAME, VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { mkdirSync, mkdtempSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// Mints a temp dir under $HOME's cache, never os.tmpdir: the sandbox masks /tmp with --tmpfs, which would hide a /tmp
// Fixture from the command running inside — the reason every acceptance corpus, checkout and cache home is staged here.
export const createHomeCacheTemporaryDirectory = (): string => {
  const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
  mkdirSync(cache, { recursive: true });
  return mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
};

describe.todo("createHomeCacheTemporaryDirectory");
