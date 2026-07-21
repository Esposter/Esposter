import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { getBlobUrlWithoutSasQuery } from "@@/server/services/resource/getBlobUrlWithoutSasQuery";
import { deepReplaceStrings } from "#shared/util/object/deepReplaceStrings";

// Every distinct asset a document embeds, read from the document's own string leaves. Any content shape works
// Without knowing where its urls live, and no leaf is ever handed to the matcher wearing a serializer's escaping.
// A url is identified by its path, so the SAS query it was last signed with is dropped and one asset embedded
// Twice — or embedded once and read back re-signed — is one entry
export const getContentBlobUrls = (content: unknown): string[] => {
  const blobUrlSearchRegex = useBlobUrlSearchRegex();
  const blobUrls = new Set<string>();
  deepReplaceStrings(content, (value) => {
    for (const [blobUrl] of value.matchAll(blobUrlSearchRegex)) blobUrls.add(getBlobUrlWithoutSasQuery(blobUrl));
    return value;
  });
  return [...blobUrls];
};
