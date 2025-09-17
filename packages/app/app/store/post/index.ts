import type { PostWithRelations } from "#shared/db/schema/posts";
import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";

export const usePostStore = defineStore("post", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<PostWithRelations>();
  const {
    createPost: storeCreatePost,
    deletePost: storeDeletePost,
    updatePost: storeUpdatePost,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Post);

  const createPost = async (input: CreatePostInput) => {
    const newPost = await $trpc.post.createPost.mutate(input);
    storeCreatePost(newPost);
  };
  const updatePost = async (input: UpdatePostInput) => {
    const updatedPost = await $trpc.post.updatePost.mutate(input);
    storeUpdatePost(updatedPost);
  };
  const deletePost = async (input: DeletePostInput) => {
    const { id } = await $trpc.post.deletePost.mutate(input);
    storeDeletePost({ id });
  };

  return {
    createPost,
    deletePost,
    items,
    updatePost,
    ...restOperationData,
    ...restData,
  };
});
