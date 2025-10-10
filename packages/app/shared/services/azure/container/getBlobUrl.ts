import { IS_PRODUCTION } from "../../../util/environment/constants";

export const getBlobUrl = (): string =>
  IS_PRODUCTION ? "https://pshpstespauea001.blob.core.windows.net" : "https://dshpstespauea001.blob.core.windows.net";
