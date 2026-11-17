import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { PostSortType } from "#shared/models/post/PostSortType";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { applyPostCounts } from "#src/services/post/applyPostCounts";
import { postCountHooks } from "#src/services/post/postCountHooks";
import { createOperationData } from "#src/services/shared/createOperationData";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { usePostCountStore } from "#src/store/post/count";
import { DatabaseEntityType } from "@esposter/db-schema";

export const usePostStore = defineStore("post", () => {
  const { $trpc } = useNuxtApp();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  const sortType = ref<PostSortType>(PostSortType.Hot);
  const { hasMore, items, readItems, readMoreItems, resetCursorPaginationData } =
    useCursorPaginationData<PostInPostWithRelations>();
  const {
    createPost: storeCreatePost,
    deletePost: storeDeletePost,
    updatePost: storeUpdatePost,
  } = createOperationData(items, ["id"], DatabaseEntityType.Post);

  const { executeMutation: executeCreatePostMutation, isPending: isCreatePostPending } = useMutation();
  const { executeMutation: executeUpdatePostMutation, isPending: isUpdatePostPending } = useMutation();
  const { executeMutation: executeDeletePostMutation } = useMutation();
  const createPost = async (input: CreatePostInput) => {
    const outcome = await executeCreatePostMutation(() => $trpc.post.createPost.mutate(input), {
      // The row is drawn with its counts and author from the server, and the id it opens by is the server's
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: Symbol("createPost"),
      onSuccess: (newPost) => {
        storeCreatePost(newPost);
      },
    });
    // The id only exists once the server has written the row, and the page that submitted the form needs it to
    // Open what was just posted. A write that did not land hands back nothing rather than a post that is not
    // There — its alert has already been raised, so the caller's only job is to stay put
    return outcome.status === MutationStatus.Succeeded ? outcome.result : undefined;
  };
  const updatePost = (input: UpdatePostInput) => {
    executeUpdatePostMutation(() => $trpc.post.updatePost.mutate(input), {
      // Read when the write is sent rather than when it was issued, and scoped to the one post this write
      // Edits: a second edit of a post queues behind the first, so its rollback has to restore what that one
      // Stored — and the same list is also appended to by the feed's own paging, which a whole-list restore
      // Would undo
      applyOptimistic: () => {
        const post = items.value.find(({ id }) => id === input.id);
        // Only the fields a post edit owns, so a vote count that moved meanwhile survives a rejection
        const previousPost = post ? { description: post.description, id: post.id, title: post.title } : undefined;
        storeUpdatePost(input);
        return () => {
          if (previousPost) storeUpdatePost(previousPost);
        };
      },
      key: input.id,
      // The server's copy of the post replaces the edit once it is kept, and the counts are read back beside it
      reconcile: async (updatedPost) => {
        storeUpdatePost(updatedPost);
        await refreshPostCounts([updatedPost.id]);
      },
    });
  };
  const deletePost = (input: DeletePostInput) => {
    executeDeletePostMutation(() => $trpc.post.deletePost.mutate(input), {
      applyOptimistic: () => {
        const deletedPost = items.value.find(({ id }) => id === input);
        storeDeletePost({ id: input });
        return () => {
          if (deletedPost) storeCreatePost(deletedPost);
        };
      },
      key: input,
      onError: async (error) => {
        createErrorAlert(error);
        // The rollback put this post back with the counts it held when the delete was sent.
        // A count that moved since reached no copy, because the post was not on the feed then
        await refreshPostCounts([input]);
      },
    });
  };
  // The feed's own copies take the counts the server returns, so a vote or a reply on a post's page reaches its card here
  postCountHooks.register((postCounts) => {
    applyPostCounts(items.value, postCounts);
  });

  return {
    createPost,
    deletePost,
    hasMore,
    isCreatePostPending,
    isUpdatePostPending,
    items,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
    sortType,
    updatePost,
  };
});
