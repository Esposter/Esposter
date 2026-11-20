/* oxlint-disable no-await-in-loop -- Pagination: each page's cursor is the one the page before it returned, and a page is deleted before the next is listed */
import type { EmptiableR2Bucket } from "#src/models/EmptiableR2Bucket";

export const emptyR2Bucket = async (bucket: EmptiableR2Bucket): Promise<void> => {
  let cursor: string | undefined;
  do {
    const listed = await bucket.list(cursor === undefined ? {} : { cursor });
    if (listed.objects.length > 0) await bucket.delete(listed.objects.map(({ key }) => key));
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor !== undefined);
};
