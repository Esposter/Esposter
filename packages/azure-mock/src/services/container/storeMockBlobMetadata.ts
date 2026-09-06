import { getMockContainerBlobDatesKey } from "#src/services/container/getMockContainerBlobDatesKey";
import { MockContainerBlobMetadataDatabase } from "#src/store/MockContainerBlobMetadataDatabase";

export const storeMockBlobMetadata = (
  containerName: string,
  blobName: string,
  metadata: Record<string, string> | undefined,
): void => {
  const key = getMockContainerBlobDatesKey(containerName, blobName);
  if (metadata) MockContainerBlobMetadataDatabase.set(key, metadata);
  else MockContainerBlobMetadataDatabase.delete(key);
};
