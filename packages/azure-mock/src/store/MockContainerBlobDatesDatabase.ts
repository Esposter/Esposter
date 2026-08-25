// Map<`${container}/${blob}`, dates> — the service-maintained timestamps for blobs written through a client.
// The two move differently and code branches on the difference: overwriting a blob advances `lastModified` and
// Leaves `createdOn` at the original create, which is what lets an age filter tell "written again just now" from
// "first written long ago". Modelling both as the write instant makes a re-upload look fresh on both axes and
// Quietly passes any test that depends on the distinction.
export interface MockBlobDates {
  createdOn: Date;
  // Re-minted on every write, which is what makes it usable as a claim: a caller that read the blob and then
  // Writes with `ifMatch` set to what it read only wins if nothing wrote in between. A value invented per read
  // (a fresh uuid each time it is asked) can never match, so every conditional write would fail.
  etag: string;
  lastModified: Date;
}

export const MockContainerBlobDatesDatabase: Map<string, MockBlobDates> = new Map<string, MockBlobDates>();
// What a listing reports for a blob seeded straight into MockContainerDatabase: content a test did not date
// Is pre-existing content, so it must read as older than any cutoff an age-filtered listing (an orphan sweep)
// Compares against — including under fake timers pinned to the epoch. Write through a client to model a blob
// That was just uploaded.
export const MOCK_BLOB_SEEDED_DATE: Date = new Date(-8640000000000000);

export const getMockContainerBlobDatesKey = (containerName: string, blobName: string): string =>
  `${containerName}/${blobName}`;

// A write dates the blob: `lastModified` always moves, `createdOn` only on the create that first made it exist.
// `isExisting` is read from the content map by the caller, before it writes — the two maps are separate, so the
// Write itself cannot tell a create from an overwrite once it has landed. Content seeded straight into the
// Container has no dates row, and overwriting it must still read as an overwrite: its `createdOn` is the seeded
// Instant rather than now, or a drained blob would look freshly created and be swept again on the next pass.
export const storeMockBlobWrite = (containerName: string, blobName: string, isExisting: boolean): void => {
  const key = getMockContainerBlobDatesKey(containerName, blobName);
  const lastModified = new Date();
  MockContainerBlobDatesDatabase.set(key, {
    createdOn:
      MockContainerBlobDatesDatabase.get(key)?.createdOn ?? (isExisting ? MOCK_BLOB_SEEDED_DATE : lastModified),
    etag: `"${crypto.randomUUID()}"`,
    lastModified,
  });
};

// What a listing reports for content seeded straight into MockContainerDatabase, which was never written through a
// Client and so has no row of its own. The etag is fixed rather than minted per read for the reason above: a caller
// That lists a seeded blob and writes it back with `ifMatch` has to be able to win that race exactly once.
export const MOCK_BLOB_SEEDED_PROPERTIES: MockBlobDates = {
  createdOn: MOCK_BLOB_SEEDED_DATE,
  etag: '"seeded"',
  lastModified: MOCK_BLOB_SEEDED_DATE,
};

// The one place a blob's dates are read: content seeded straight into MockContainerDatabase was never written
// Through a client and so has no row of its own, and every reader — a listing, `getProperties`, a conditional
// Write — has to report it the same way, or the same blob reads as pre-existing on one path and undated on
// The next.
export const readMockBlobDates = (containerName: string, blobName: string): MockBlobDates =>
  MockContainerBlobDatesDatabase.get(getMockContainerBlobDatesKey(containerName, blobName)) ??
  MOCK_BLOB_SEEDED_PROPERTIES;
