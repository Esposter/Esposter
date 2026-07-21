// A url is matched in content with whatever SAS query it was last signed with, but it is identified by its path
// Alone — the query is re-signed on every read, so it can never be part of the key two passes agree on
export const getBlobUrlWithoutSasQuery = (blobUrl: string) => {
  const queryParamIndex = blobUrl.indexOf("?");
  return queryParamIndex === -1 ? blobUrl : blobUrl.slice(0, queryParamIndex);
};
