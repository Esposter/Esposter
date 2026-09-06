import { ID_SEPARATOR } from "@esposter/shared";

// Both halves are encoded before they are joined: a blob name may hold the separator and the mock accepts any
// container name, so joining them raw lets one pair's key collide with another's and mix their records
export const getMockContainerBlobDatesKey = (containerName: string, blobName: string): string =>
  `${encodeURIComponent(containerName)}${ID_SEPARATOR}${encodeURIComponent(blobName)}`;
