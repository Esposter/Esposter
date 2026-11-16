/* oxlint-disable no-await-in-loop -- Pagination: each ListObjectsV2 page is requested with the token the one before it returned */
import type { R2ListedObject } from "#src/models/storage/R2ListedObject";

import { parseListBucketResult } from "#src/services/storage/parseListBucketResult";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every object of a bucket reached through its S3 API, under `prefix` when one is given, read page by page. A refused
// Page throws, since its error document lists no entries and would otherwise read as an empty bucket
export const listBucketObjects = async (
  fetchBucket: (url: string) => Promise<Response>,
  bucketUrl: string,
  prefix?: string,
): Promise<R2ListedObject[]> => {
  const objects: R2ListedObject[] = [];
  let continuationToken: string | undefined;
  do {
    const url = new URL(bucketUrl);
    url.searchParams.set("list-type", "2");
    if (prefix !== undefined) url.searchParams.set("prefix", prefix);
    if (continuationToken !== undefined) url.searchParams.set("continuation-token", continuationToken);
    const response = await fetchBucket(url.toString());
    if (!response.ok) throw new InvalidOperationError(Operation.Read, url.toString(), `responds ${response.status}`);
    const page = parseListBucketResult(await response.text());
    objects.push(...page.objects);
    continuationToken = page.nextContinuationToken;
  } while (continuationToken !== undefined);
  return objects;
};
