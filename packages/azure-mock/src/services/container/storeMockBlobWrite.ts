import { MOCK_BLOB_SEEDED_DATE } from "#src/services/container/constants";
import { getMockBlobKey } from "#src/services/container/getMockBlobKey";
import { MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";

// A write dates the blob: `lastModified` always moves, `createdOn` only on the create that first made it exist.
// `isExisting` is read from the content map by the caller, before it writes — the two maps are separate, so the
// Write itself cannot tell a create from an overwrite once it has landed. Content seeded straight into the
// Container has no dates row, and overwriting it must still read as an overwrite: its `createdOn` is the seeded
// Instant rather than now, or a drained blob would look freshly created and be swept again on the next pass.
export const storeMockBlobWrite = (containerName: string, blobName: string, isExisting: boolean): void => {
  const key = getMockBlobKey(containerName, blobName);
  const lastModified = new Date();
  MockContainerBlobDatesDatabase.set(key, {
    createdOn:
      MockContainerBlobDatesDatabase.get(key)?.createdOn ?? (isExisting ? MOCK_BLOB_SEEDED_DATE : lastModified),
    etag: `"${crypto.randomUUID()}"`,
    lastModified,
  });
};
