import type { readPostsInputSchema } from "#shared/models/db/post/ReadPostsInput";
import type { PostKey } from "#src/models/post/PostKey";
import type { Page, PostInPostWithRelations } from "@esposter/db-schema";
import type { Except } from "type-fest";
import type { z } from "zod";

type PostPagingOperations = Pick<
  ReturnType<typeof useCursorPaginationOperationData<PostKey>>,
  "readItems" | "readMoreItems"
>;
type ReadPostsQuery = Except<NonNullable<z.input<typeof readPostsInputSchema>>, "cursor">;
// The paging every post list shares: the first page reads into the list under its payload key, and each later page
// Follows the cursor the page before it left. The cursor is the paging's own, so a query never carries one. `readPage`
// Lands a page's rows on the overlay and hands the list the ids the page named
export const usePagedPostRead = ({
  readItems,
  readMoreItems,
  readPage,
}: PostPagingOperations & { readPage: (page: Page<PostInPostWithRelations>) => Page<PostKey> }) => {
  const { $trpc } = useNuxtApp();
  const readFirstPage = (query: ReadPostsQuery, key: string) =>
    readItems(async () => readPage(await $trpc.post.readPosts.query(query)), { key });
  const readMorePages = (query: ReadPostsQuery, onComplete: () => void) =>
    readMoreItems(async (cursor) => readPage(await $trpc.post.readPosts.query({ ...query, cursor })), onComplete);
  return { readFirstPage, readMorePages };
};
