import { getMockContainer } from "#src/services/container/getMockContainer";
import {
  getMockContainerBlobDatesKey,
  MockContainerBlobDatesDatabase,
} from "#src/store/MockContainerBlobDatesDatabase";
import { storeMockBlobMetadata } from "#src/store/MockContainerBlobMetadataDatabase";

// A blob is its content plus everything keyed to it, and the dates and metadata live in maps of their own —
// So a delete that takes only the content leaves records the next blob seeded under that name inherits, and a
// Listing then reports a deleted blob's metadata against content that never carried any. Reports whether the
// Blob was there, since both delete paths answer 404 for one that was not.
export const deleteMockBlob = (containerName: string, blobName: string): boolean => {
  if (!getMockContainer(containerName).delete(blobName)) return false;
  MockContainerBlobDatesDatabase.delete(getMockContainerBlobDatesKey(containerName, blobName));
  storeMockBlobMetadata(containerName, blobName, undefined);
  return true;
};
