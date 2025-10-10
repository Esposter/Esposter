import { IS_PRODUCTION } from "@esposter/shared/src/util/environment/constants.js";
// We need the js version as it is used by nuxt configuration
// at install dependencies time before the packages have been built
export const getBlobUrl = () =>
  IS_PRODUCTION ? "https://pshpstespauea001.blob.core.windows.net" : "https://dshpstespauea001.blob.core.windows.net";
