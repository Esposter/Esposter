import { getMockBlobKey } from "#src/services/container/getMockBlobKey";
import { MockContainerBlobMetadataDatabase } from "#src/store/MockContainerBlobMetadataDatabase";

// Blobs seeded straight into MockContainerDatabase carry none, which is what the service reports for a blob
// Uploaded without any — an absent record rather than an empty one, so a reader cannot tell them apart
export const readMockBlobMetadata = (containerName: string, blobName: string): Record<string, string> | undefined =>
  MockContainerBlobMetadataDatabase.get(getMockBlobKey(containerName, blobName));
