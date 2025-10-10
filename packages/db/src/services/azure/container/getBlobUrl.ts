import { getBlobUrl as getBaseBlobUrl } from "@/services/azure/container/getBlobUrl.js";

export const getBlobUrl: () => string = getBaseBlobUrl;