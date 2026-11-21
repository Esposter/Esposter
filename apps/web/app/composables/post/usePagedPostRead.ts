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
  // The first page's query is read each time the page is read, not once: a refresh after a sort change asks for the sort
  // The list names now, where a query captured at the first read would send the sort it started with
  const readFirstPage = (getQuery: () => ReadPostsQuery, key: string) =>
    readItems(async () => readPage(await $trpc.post.readPosts.query(getQuery())), { key });
  const readMorePages = (query: ReadPostsQuery, onComplete: () => void) =>
    readMoreItems(async (cursor) => readPage(await $trpc.post.readPosts.query({ ...query, cursor })), onComplete);
  return { readFirstPage, readMorePages };
};
