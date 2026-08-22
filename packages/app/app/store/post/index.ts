import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { PostSortType } from "@/models/post/PostSortType";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const usePostStore = defineStore("post", () => {
  const { $trpc } = useNuxtApp();
  const sortType = ref(PostSortType.Hot);
  const { items, ...restData } = useCursorPaginationData<PostWithRelations>();
  const {
    createPost: storeCreatePost,
    deletePost: storeDeletePost,
    updatePost: storeUpdatePost,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Post);

  const { executeMutation: executeCreatePostMutation } = useMutation();
  const { executeMutation: executeUpdatePostMutation } = useMutation();
  const { executeMutation: executeDeletePostMutation } = useMutation();
  // Server-generated post — non-optimistic, applied in onSuccess
  const createPost = async (input: CreatePostInput) => {
    const outcome = await executeCreatePostMutation(() => $trpc.post.createPost.mutate(input), {
      // Server-generated post with no id yet, so each create gets a per-call symbol
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
  const updatePost = async (input: UpdatePostInput) => {
    await executeUpdatePostMutation(() => $trpc.post.updatePost.mutate(input), {
      // Read when the write is sent rather than when it was issued, and scoped to the one post this write
      // Edits: a second edit of a post queues behind the first, so its rollback has to restore what that one
      // Stored — and the same list is also appended to by the feed's own paging, which a whole-list restore
      // Would undo
      applyOptimistic: () => {
        const post = items.value.find(({ id }) => id === input.id);
        // Only the fields a post edit owns, so a rejection cannot reinstate a vote count that moved meanwhile
        const previousPost = post ? { description: post.description, id: post.id, title: post.title } : undefined;
        storeUpdatePost(input);
        return () => {
          if (previousPost) storeUpdatePost(previousPost);
        };
      },
      key: input.id,
      onSuccess: (updatedPost) => {
        storeUpdatePost(updatedPost);
      },
    });
  };
  const deletePost = async (input: DeletePostInput) => {
    await executeDeletePostMutation(() => $trpc.post.deletePost.mutate(input), {
      applyOptimistic: () => {
        // The one row this write removes, read when the write is sent: deletes of different posts do not queue
        // Against each other, so restoring a copy of the list would resurrect a post deleted beside this one
        const deletedPost = items.value.find(({ id }) => id === input);
        storeDeletePost({ id: input });
        return () => {
          // The row comes back at the end rather than in its ranked place — cosmetic next to dropping rows the
          // Feed gained while the delete was in flight
          if (deletedPost) storeCreatePost(deletedPost);
        };
      },
      key: input,
    });
  };

  return {
    createPost,
    deletePost,
    items,
    sortType,
    updatePost,
    ...restOperationData,
    ...restData,
  };
});
