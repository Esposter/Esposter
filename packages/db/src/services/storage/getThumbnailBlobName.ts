// The thumbnail blob sits beside its original at {prefix}/{id}.thumb — upload and download must agree on this path.
export const getThumbnailBlobName = (prefix: string, id: string) => `${prefix}/${id}.thumb`;
