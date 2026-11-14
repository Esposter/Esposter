import type { MockR2Bucket } from "#src/models/MockR2Bucket";

export const emptyR2Bucket = async (bucket: MockR2Bucket): Promise<void> => {
  let cursor: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- each page's cursor is the one the page before it returned
    const listed = await bucket.list({ cursor });
    if (listed.objects.length > 0) await bucket.delete(listed.objects.map(({ key }) => key));
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor !== undefined);
};
