import type { R2Bucket, R2ListOptions, R2Object } from "@cloudflare/workers-types";

import { omitUndefined } from "@esposter/shared";

// Every object under a prefix, paged through R2's cursor, with whatever metadata the caller includes. No delimiter is
// Passed, so the listing is flat: a prefix names a directory without its trailing slash, and a delimited listing would
// Report everything below it as a prefix and no object
export const listR2Objects = async (
  bucket: R2Bucket,
  prefix: string,
  include?: R2ListOptions["include"],
): Promise<R2Object[]> => {
  const objects: R2Object[] = [];
  let cursor: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- Pagination: each page's cursor is what the next page is requested with
    const page = await bucket.list(omitUndefined({ cursor, include, prefix }));
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return objects;
};
