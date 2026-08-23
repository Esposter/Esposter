import type { BlobHierarchyListSegment, ContainerListBlobHierarchySegmentResponse } from "@azure/storage-blob";

import { getListBlobsXml } from "#src/services/container/getListBlobsXml";
import { createMockResponse } from "#src/services/createMockResponse";
// The flat and hierarchy listings must report the same envelope for the same blobs, so both build it here.
// The segment arrives whole rather than as blobItems alone: a hierarchy listing also carries blobPrefixes, and
// Folding those into blobItems drops the virtual directories the caller passed a delimiter to get. A flat
// Listing passes the same segment without them, which is what makes the hierarchy type cover both
export const getListBlobsSegmentResponse = (
  containerName: string,
  prefix: string,
  segment: BlobHierarchyListSegment,
  blobsXml: string,
): ContainerListBlobHierarchySegmentResponse => {
  const segmentResponse = { containerName, marker: "", prefix, segment, serviceEndpoint: "" };
  return {
    _response: {
      ...createMockResponse(200),
      bodyAsText: getListBlobsXml(containerName, blobsXml),
      parsedBody: segmentResponse,
    },
    ...segmentResponse,
  };
};
