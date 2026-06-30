import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// The one cache home every heavy acceptance/equivalence test shares, so the warm snapshot (keyed by lockfile hash,
// Identical across corpora mirroring this repo) is captured once and reused rather than re-installed per file.
// Deterministic — NOT mkdtemp — so independent test workers re-derive the same path with no value passed across the
// Process boundary; the vitest global teardown removes it.
export const resolveAcceptanceCacheHome = (): string =>
  join(homedir(), HOME_CACHE_DIRECTORY_NAME, `${VIRRUN_TEMP_DIR_PREFIX}acceptance`);

describe.todo("resolveAcceptanceCacheHome");
