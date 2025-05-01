import type { PostWithRelations } from "#shared/db/schema/posts";
import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";

export const usePostStore = defineStore("post", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = createCursorPaginationData<PostWithRelations>();
  const {
    createPost: storeCreatePost,
    deletePost: storeDeletePost,
    updatePost: storeUpdatePost,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Post);

  const createPost = async (input: CreatePostInput) => {
    const newPost = await $trpc.post.createPost.mutate(input);
    if (!newPost) return;

    storeCreatePost(newPost);
  };
  const updatePost = async (input: UpdatePostInput) => {
    const updatedPost = await $trpc.post.updatePost.mutate(input);
    if (!updatedPost) return;

    storeUpdatePost(updatedPost);
  };
  const deletePost = async (input: DeletePostInput) => {
    const deletedPost = await $trpc.post.deletePost.mutate(input);
    if (!deletedPost) return;

    storeDeletePost({ id: deletedPost.id });
  };

  return {
    createPost,
    deletePost,
    updatePost,
    ...restOperationData,
    ...restData,
  };
});
