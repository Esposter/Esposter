import { type PostWithRelations } from "@/db/schema/posts";
import { type CreatePostInput, type DeletePostInput, type UpdatePostInput } from "@/server/trpc/routers/post";
import { createCursorPaginationData } from "@/services/shared/pagination/createCursorPaginationData";

export const usePostStore = defineStore("post", () => {
  const { $client } = useNuxtApp();
  const { itemList: postList, pushItemList: pushPostList, ...rest } = createCursorPaginationData<PostWithRelations>();

  const createPost = async (input: CreatePostInput) => {
    const newPost = await $client.post.createPost.mutate(input);
    if (!newPost) return;

    postList.value.push(newPost);
  };
  const updatePost = async (input: UpdatePostInput) => {
    const updatedPost = await $client.post.updatePost.mutate(input);
    if (!updatedPost) return;

    const index = postList.value.findIndex((r) => r.id === updatedPost.id);
    if (index > -1) postList.value[index] = { ...postList.value[index], ...updatedPost };
  };
  const deletePost = async (postId: DeletePostInput) => {
    const deletedPost = await $client.post.deletePost.mutate(postId);
    if (!deletedPost) return;

    postList.value = postList.value.filter((r) => r.id !== deletedPost.id);
  };

  return {
    postList,
    pushPostList,
    ...rest,
    createPost,
    updatePost,
    deletePost,
  };
});
