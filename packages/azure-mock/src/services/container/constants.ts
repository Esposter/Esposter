import type { MockBlobDates } from "#src/models/container/MockBlobDates";

// What a listing reports for a blob seeded straight into MockContainerDatabase: content a test did not date
// Is pre-existing content, so it must read as older than any cutoff an age-filtered listing (an orphan sweep)
// Compares against — including under fake timers pinned to the epoch. Write through a client to model a blob
// That was just uploaded.
export const MOCK_BLOB_SEEDED_DATE: Date = new Date(-8640000000000000);
// What a listing reports for content seeded straight into MockContainerDatabase, which was never written through
// A client and so has no row of its own. The etag is fixed rather than minted per read for the reason
// `MockBlobDates` gives: a caller that lists a seeded blob and writes it back with `ifMatch` has to be able to
// Win that race exactly once.
export const MOCK_BLOB_SEEDED_PROPERTIES: MockBlobDates = {
  createdOn: MOCK_BLOB_SEEDED_DATE,
  etag: '"seeded"',
  lastModified: MOCK_BLOB_SEEDED_DATE,
};
