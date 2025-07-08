import { IS_PRODUCTION } from "../environment/constants";

export const getBlobUrl = () =>
  IS_PRODUCTION ? "https://pshpstespauea001.blob.core.windows.net" : "https://dshpstespauea001.blob.core.windows.net";
