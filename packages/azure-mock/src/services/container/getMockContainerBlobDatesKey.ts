import { ID_SEPARATOR } from "@esposter/shared";

// A blob name may hold the separator and the mock accepts any container name, so both halves are encoded.
// Joining them raw lets one pair's key collide with another's and mix their records
export const getMockContainerBlobDatesKey = (containerName: string, blobName: string): string =>
  `${encodeURIComponent(containerName)}${ID_SEPARATOR}${encodeURIComponent(blobName)}`;
