import { getMockContainerBlobDatesKey } from "#src/store/MockContainerBlobDatesDatabase";

// Map<`${container}/${blob}`, metadata> — the user-defined name/value pairs a blob carries, kept beside the
// Content map rather than inside it so seeding content straight into MockContainerDatabase keeps working.
// Metadata is replaced wholesale by a write, never merged, which is the service's own semantics: an upload
// That names no metadata clears whatever the previous write set.
export const MockContainerBlobMetadataDatabase: Map<string, Record<string, string>> = new Map<
  string,
  Record<string, string>
>();

export const storeMockBlobMetadata = (
  containerName: string,
  blobName: string,
  metadata: Record<string, string> | undefined,
): void => {
  const key = getMockContainerBlobDatesKey(containerName, blobName);
  if (metadata) MockContainerBlobMetadataDatabase.set(key, metadata);
  else MockContainerBlobMetadataDatabase.delete(key);
};

// Blobs seeded straight into MockContainerDatabase carry none, which is what the service reports for a blob
// Uploaded without any — an absent record rather than an empty one, so a reader cannot tell them apart
export const readMockBlobMetadata = (containerName: string, blobName: string): Record<string, string> | undefined =>
  MockContainerBlobMetadataDatabase.get(getMockContainerBlobDatesKey(containerName, blobName));
