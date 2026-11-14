import type { R2ListPage } from "#src/models/cutover/R2ListPage";

import { readXmlElement } from "#src/services/cutover/cloudflare/r2/readXmlElement";

// One page of a ListObjectsV2 answer: each Contents entry as an object, and the token the next page is asked from
export const parseR2ListObjectsXml = (xml: string): R2ListPage => {
  const contents: string[] = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) ?? [];
  return {
    nextContinuationToken: readXmlElement(xml, "NextContinuationToken"),
    objects: contents.map((entry) => ({
      etag: readXmlElement(entry, "ETag").replaceAll('"', ""),
      key: readXmlElement(entry, "Key"),
      size: Number(readXmlElement(entry, "Size")),
    })),
  };
};
