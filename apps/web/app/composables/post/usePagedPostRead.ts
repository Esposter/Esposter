import type { readPostsInputSchema } from "#shared/models/db/post/ReadPostsInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";
import type { Except } from "type-fest";
import type { z } from "zod";

type PostPagingOperations = Pick<
  ReturnType<typeof useCursorPaginationOperationData<PostInPostWithRelations>>,
  "readItems" | "readMoreItems"
>;
type ReadPostsQuery = Except<NonNullable<z.input<typeof readPostsInputSchema>>, "cursor">;
// The paging every post list shares: the first page reads into the list under its payload key, and each later page
// Follows the cursor the page before it left. The cursor is the paging's own, so a query never carries one
export const usePagedPostRead = ({ readItems, readMoreItems }: PostPagingOperations) => {
  const { $trpc } = useNuxtApp();
  const readFirstPage = (query: ReadPostsQuery, key: string) =>
    readItems(() => $trpc.post.readPosts.query(query), { key });
  const readMorePages = (query: ReadPostsQuery, onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.post.readPosts.query({ ...query, cursor }), onComplete);
  return { readFirstPage, readMorePages };
};
