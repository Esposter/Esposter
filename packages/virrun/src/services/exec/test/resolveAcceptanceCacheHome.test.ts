import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// The single cache home every heavy acceptance/equivalence test points VIRRUN_CACHE_HOME at, so the warm dependency
// Snapshot (keyed by lockfile hash, the same on every corpus that mirrors this repo) is captured ONCE and reused
// Instead of each file installing the whole monorepo closure into its own mkdtemp cache. Deterministic — NOT mkdtemp
// — so independent test workers each re-derive the identical path with no value passed across the process boundary;
// The first file to run captures, the rest fork the frozen upper for free. Under $HOME/.cache (never os.tmpdir) for
// The same reason the corpora are: the sandbox masks /tmp with --tmpfs, which would hide a /tmp overlay layer from
// The command running inside. The fixed `-acceptance` suffix keeps it isolated from a real user snapshot; the
// Vitest global teardown removes it, so the stable name never leaks between runs. A `.test.ts` so ctix keeps it out
// Of the public barrel.
export const resolveAcceptanceCacheHome = (): string =>
  join(homedir(), HOME_CACHE_DIRECTORY_NAME, `${VIRRUN_TEMP_DIR_PREFIX}acceptance`);

describe.todo("resolveAcceptanceCacheHome");
