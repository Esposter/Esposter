import type { R2ListedObject } from "#src/models/cloudflare/R2ListedObject";

import { InvalidOperationError, Operation } from "@esposter/shared";

const decodeXmlEntities = (text: string): string =>
  text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");

// One tag's text in a listing, which S3 writes in one fixed shape. A missing tag is a listing the parser cannot trust
const readXmlText = (xml: string, tag: string): string => {
  const value = new RegExp(`<${tag}>([^<]*)</${tag}>`, "u").exec(xml)?.[1];
  if (value === undefined) throw new InvalidOperationError(Operation.Read, tag, "is missing from the bucket listing");
  return decodeXmlEntities(value);
};

// The keys and write instants of one ListObjectsV2 page, and the token of the next page when this one is not the last.
// No XML reader is a dependency of the scripts, and the listing's shape is fixed, so its tags are read directly
export const parseListBucketResult = (xml: string): { nextContinuationToken?: string; objects: R2ListedObject[] } => ({
  nextContinuationToken: xml.includes("<IsTruncated>true</IsTruncated>")
    ? readXmlText(xml, "NextContinuationToken")
    : undefined,
  objects: Array.from(xml.matchAll(/<Contents>(?<contents>[\s\S]*?)<\/Contents>/gu), ({ groups }) => {
    const contents = groups?.contents ?? "";
    return { key: readXmlText(contents, "Key"), lastModified: new Date(readXmlText(contents, "LastModified")) };
  }),
});
