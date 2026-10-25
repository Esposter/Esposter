// @vitest-environment nuxt
import type { ReadPostsInput } from "#shared/models/db/post/ReadPostsInput";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { PostSortType } from "@/models/post/PostSortType";
import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useCommentStore } from "@/store/post/comment";
import { describe, expect, test } from "vitest";

describe(useReadComments, () => {
  const { trpcMsw } = setupMswTrpc();
  const parentId = crypto.randomUUID();

  test("reads each branch under the comment sort the reader chose", async () => {
    expect.hasAssertions();

    let receivedInput: ReadPostsInput | undefined;
    trpcMsw.post.readPosts.query(({ input }) => {
      receivedInput = input;
      return new CursorPaginationData();
    });
    const commentStore = useCommentStore();
    const { commentSortType } = storeToRefs(commentStore);
    commentSortType.value = PostSortType.Top;
    const { readComments } = useReadComments(parentId);
    await readComments();

    expect(receivedInput?.sortBy).toStrictEqual(PostSortTypeSortByMap[PostSortType.Top]);
  });
});
