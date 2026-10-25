import { getCityStreamName } from "#src/services/genshinAssets/world/getCityStreamName";
import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";

export const getCityBlobName = (code: string): string => getStreamBlobName(getCityStreamName(code));
