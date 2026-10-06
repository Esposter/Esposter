import { HOME_CACHE_DIRECTORY_NAME } from "#src/services/exec/util/constants";
import { homedir } from "node:os";
import { join } from "node:path";

// The $HOME cache root the tests stage their temp directories under (createHomeCacheTemporaryDirectory). A plain `.ts`
// (not a `.test.ts`) so the non-test globalSetup can reap the same root the tests mint into.
export const getHomeCacheDirectory = (): string => join(homedir(), HOME_CACHE_DIRECTORY_NAME);
