import { CAPABILITY_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { join } from "node:path";

// Where the persisted os-backend capability verdict lives: host-global (getGlobalCacheDirectory), because the bwrap
// Verdict holds for the whole host. The reader, the writer and `cache clean --all` all resolve it here, so none of the
// Three can go on looking in a directory the other two have left.
export const getCapabilityCachePath = (): string => join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME);
