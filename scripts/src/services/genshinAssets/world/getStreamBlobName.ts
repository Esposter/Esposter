import { getPathHash } from "#src/services/genshinAssets/shared/getPathHash";
import { STREAM_PATH_PREFIX } from "#src/services/genshinAssets/world/constants";

// The name AnimeStudio exports a StreamGen blob under, from its path's hash, given the name of the tile or city area
// It places (`BigWorld_1_-2` is `012854bd`, `Area_FQD_City` is `6977197b`, both checked against the asset index)
export const getStreamBlobName = (streamName: string): string => getPathHash(`${STREAM_PATH_PREFIX}${streamName}`);
