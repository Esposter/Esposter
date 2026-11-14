import type { ListedBlobItem } from "#src/models/storage/ListedBlobItem";
import type { R2Bucket } from "@cloudflare/workers-types";

// Every object under a prefix, paged through R2's cursor. No delimiter is passed, so the listing is flat: a prefix names a
// Directory without its trailing slash, and a delimited listing would report everything below it as a prefix and no object
export const listBlobItems = async (bucket: R2Bucket, prefix: string): Promise<ListedBlobItem[]> => {
  const blobItems: ListedBlobItem[] = [];
  let cursor: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- Each page's cursor is what the next page is requested with
    const page = await bucket.list({ cursor, prefix });
    blobItems.push(...page.objects.map(({ key, uploaded }) => ({ name: key, uploaded })));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return blobItems;
};
