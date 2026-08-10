import type { BlobItem, ContainerListBlobFlatSegmentResponse } from "@azure/storage-blob";

import { getListBlobsXml } from "@/services/container/getListBlobsXml";
import { createMockResponse } from "@/services/createMockResponse";
// The flat and hierarchy listings must report the same envelope for the same blobs, so both build it here
export const getListBlobsSegmentResponse = (
  containerName: string,
  prefix: string,
  blobItems: BlobItem[],
  blobsXml: string,
): ContainerListBlobFlatSegmentResponse => {
  const segmentResponse = { containerName, marker: "", prefix, segment: { blobItems }, serviceEndpoint: "" };
  return {
    _response: {
      ...createMockResponse(200),
      bodyAsText: getListBlobsXml(containerName, blobsXml),
      parsedBody: segmentResponse,
    },
    ...segmentResponse,
  };
};
