import type { MockBlobDates } from "#src/models/container/MockBlobDates";

import { MOCK_BLOB_SEEDED_PROPERTIES } from "#src/services/container/constants";
import { getMockBlobKey } from "#src/services/container/getMockBlobKey";
import { MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";

// The one place a blob's dates are read: content seeded straight into MockContainerDatabase was never written
// Through a client and so has no row of its own, and every reader — a listing, `getProperties`, a conditional
// Write — has to report it the same way, or the same blob reads as pre-existing on one path and undated on
// The next.
export const readMockBlobDates = (containerName: string, blobName: string): MockBlobDates =>
  MockContainerBlobDatesDatabase.get(getMockBlobKey(containerName, blobName)) ?? MOCK_BLOB_SEEDED_PROPERTIES;
