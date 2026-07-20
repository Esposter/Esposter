import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { PostSortType } from "@/models/post/PostSortType";
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
    await executeCreatePostMutation(() => $trpc.post.createPost.mutate(input), {
      // Server-generated post with no id yet, so each create gets a per-call symbol
      key: Symbol("createPost"),
      onSuccess: (newPost) => {
        storeCreatePost(newPost);
      },
    });
  };
  const updatePost = async (input: UpdatePostInput) => {
    const snapshot = items.value.map((post) => ({ ...post }));
    await executeUpdatePostMutation(() => $trpc.post.updatePost.mutate(input), {
      applyOptimistic: () => {
        storeUpdatePost(input);
        return () => {
          items.value = snapshot;
        };
      },
      key: input.id,
      onSuccess: (updatedPost) => {
        storeUpdatePost(updatedPost);
      },
    });
  };
  const deletePost = async (input: DeletePostInput) => {
    const snapshot = [...items.value];
    await executeDeletePostMutation(() => $trpc.post.deletePost.mutate(input), {
      applyOptimistic: () => {
        storeDeletePost({ id: input });
        return () => {
          items.value = snapshot;
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
