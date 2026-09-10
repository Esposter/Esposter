import { getLocalCacheDirectory } from "#src/services/exec/util/getLocalCacheDirectory";
import { VIRRUN_RUNS_DIRECTORY_NAME } from "#src/services/exec/wsl/constants";
import { join } from "node:path";
// The run registry's one home. Under the LOCAL cache root (the Windows `~`, getLocalCacheDirectory) rather than the
// WSL-native one: every entry is written and read host-side, by the same pid domain the names record, so routing it
// Across the 9p bridge would buy nothing and cost a stat per entry on the startup path.
export const getWslRunsDirectory = (): string => join(getLocalCacheDirectory(), VIRRUN_RUNS_DIRECTORY_NAME);
