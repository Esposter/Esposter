export const getPublishPath = (id: number | string, version: number, extension: string) =>
  `${id}_v${version}.${extension}`;
