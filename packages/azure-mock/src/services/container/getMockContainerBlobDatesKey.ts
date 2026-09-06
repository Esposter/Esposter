export const getMockContainerBlobDatesKey = (containerName: string, blobName: string): string =>
  `${containerName}/${blobName}`;
