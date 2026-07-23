// Map<`${container}/${blob}`, createdOn> — creation instants for blobs written through a client.
export const MockContainerCreatedOnDatabase: Map<string, Date> = new Map<string, Date>();
// What a listing reports for a blob seeded straight into MockContainerDatabase: content a test did not date
// Is pre-existing content, so it must read as older than any cutoff an age-filtered listing (an orphan sweep)
// Compares against — including under fake timers pinned to the epoch. Write through a client to model a blob
// That was just uploaded.
export const MOCK_BLOB_SEEDED_CREATED_ON: Date = new Date(-8640000000000000);

export const getMockContainerCreatedOnKey = (containerName: string, blobName: string): string =>
  `${containerName}/${blobName}`;
