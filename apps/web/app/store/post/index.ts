import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostWithRelations } from "@esposter/db-schema";

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
  const createPost = async (input: CreatePostInput) => {
    const outcome = await executeCreatePostMutation(() => $trpc.post.createPost.mutate(input), {
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
    const outcome = await executeUpdatePostMutation(() => $trpc.post.updatePost.mutate(input), {
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
      onSuccess: (updatedPost) => {
        storeUpdatePost(updatedPost);
      },
    });
    // Same contract as the create: the page leaves for the post only once the edit is on the server. A rejected
    // Edit has already been rolled back on the feed, so navigating away would show the reader the old title and
    // Throw away the one they wrote
    return outcome.status === MutationStatus.Succeeded ? outcome.result : undefined;
  };
  const deletePost = async (input: DeletePostInput) => {
    await executeDeletePostMutation(() => $trpc.post.deletePost.mutate(input), {
      applyOptimistic: () => {
        // The one row this write removes, read when the write is sent — deletes of different posts do not queue
        // Against each other
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
