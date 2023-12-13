export const getPublishPath = (id: string | number, version: number, extension: string) =>
  `${id}_v${version}.${extension}`;
