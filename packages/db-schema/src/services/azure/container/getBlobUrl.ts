import { getIsProduction } from "@esposter/shared";

export const getBlobUrl = (): string =>
  getIsProduction()
    ? "https://pshpstespauea001.blob.core.windows.net"
    : "https://dshpstespauea001.blob.core.windows.net";
