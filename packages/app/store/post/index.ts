import type { PostWithRelations } from "@/db/schema/posts";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import type { CreatePostInput, DeletePostInput, UpdatePostInput } from "@/server/trpc/routers/post";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";

export const usePostStore = defineStore("post", () => {
  const { $client } = useNuxtApp();
  const { itemList, ...restData } = createCursorPaginationData<PostWithRelations>();
  const {
    createPost: storeCreatePost,
    updatePost: storeUpdatePost,
    deletePost: storeDeletePost,
    ...restOperationData
  } = createOperationData(itemList, DatabaseEntityType.Post);

  const createPost = async (input: CreatePostInput) => {
    const newPost = await $client.post.createPost.mutate(input);
    if (!newPost) return;

    storeCreatePost(newPost);
  };
  const updatePost = async (input: UpdatePostInput) => {
    const updatedPost = await $client.post.updatePost.mutate(input);
    if (!updatedPost) return;

    storeUpdatePost(updatedPost);
  };
  const deletePost = async (input: DeletePostInput) => {
    const deletedPost = await $client.post.deletePost.mutate(input);
    if (!deletedPost) return;

    storeDeletePost(deletedPost.id);
  };

  return {
    ...restOperationData,
    createPost,
    updatePost,
    deletePost,
    ...restData,
  };
});
