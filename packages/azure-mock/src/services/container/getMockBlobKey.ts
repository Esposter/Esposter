import { ID_SEPARATOR } from "@esposter/shared";

// The key every side map holds a blob under — its dates, its metadata — since none of them can live inside the
// Content map without breaking content seeded straight into it.
// A blob name may hold the separator and the mock accepts any container name, so both halves are encoded.
// Joining them raw lets one pair's key collide with another's and mix their records
export const getMockBlobKey = (containerName: string, blobName: string): string =>
  `${encodeURIComponent(containerName)}${ID_SEPARATOR}${encodeURIComponent(blobName)}`;
