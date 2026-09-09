import { getMockBlobKey } from "#src/services/container/getMockBlobKey";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { storeMockBlobMetadata } from "#src/services/container/storeMockBlobMetadata";
import { MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";

// A blob is its content plus everything keyed to it, and the dates and metadata live in maps of their own —
// So a delete that takes only the content leaves records the next blob seeded under that name inherits, and a
// Listing then reports a deleted blob's metadata against content that never carried any. Reports whether the
// Blob was there, since both delete paths answer 404 for one that was not.
export const deleteMockBlob = (containerName: string, blobName: string): boolean => {
  if (!getMockContainer(containerName).delete(blobName)) return false;
  MockContainerBlobDatesDatabase.delete(getMockBlobKey(containerName, blobName));
  storeMockBlobMetadata(containerName, blobName, undefined);
  return true;
};
