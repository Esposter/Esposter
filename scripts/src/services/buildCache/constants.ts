import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Every worktree on the machine shares one store, so a package built in one is restored in the next instead of rebuilt
export const BUILD_CACHE_DIRECTORY: string = join(homedir(), SITE_NAME, "dist-cache");
// The newest keys kept per package: a key moves with every source edit, so an unbounded store grows with every commit
export const BUILD_CACHE_KEEP_COUNT = 5;
export const BUILD_OUTPUT_DIRECTORY = "dist";
// A temporary folder's name starts with a dot, so the eviction never counts one as a key
export const BUILD_CACHE_TEMPORARY_PREFIX = ".";
export const BUILD_CACHE_RUN_IN_SLOT_PATH = ".agents/skills/throughput/scripts/run-in-slot.sh";
// The file a package's dist carries the key it was built or restored under in, so a dist that no longer matches its
// Sources is seen without rebuilding anything. Written beside the output rather than into the cache, which stores the bare build.
export const BUILD_STAMP_FILE = ".build-cache-key";
