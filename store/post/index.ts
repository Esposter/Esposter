import type { PostWithRelations } from "@/db/schema/posts";
import type { PaginationData } from "@/models/shared/pagination/PaginationData";

export const usePostStore = defineStore("post", () => {
  const paginationData = ref<PaginationData<PostWithRelations>>({
    items: [],
    nextCursor: null,
    hasMore: false,
  });
  const postList = computed({
    get: () => paginationData.value.items,
    set: (posts: PostWithRelations[]) => {
      paginationData.value.items = posts;
    },
  });
  const nextCursor = computed({
    get: () => paginationData.value.nextCursor,
    set: (nextCursor: string | null) => {
      paginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => paginationData.value.hasMore,
    set: (hasMore: boolean) => {
      paginationData.value.hasMore = hasMore;
    },
  });

  const initialisePaginationData = (data: PaginationData<PostWithRelations>) => {
    paginationData.value = data;
  };
  const pushPosts = (posts: PostWithRelations[]) => {
    postList.value.push(...posts);
  };
  const createPost = (newPost: PostWithRelations) => {
    postList.value.push(newPost);
  };
  const updatePost = (updatedPost: PostWithRelations) => {
    const index = postList.value.findIndex((r) => r.id === updatedPost.id);
    if (index > -1) postList.value[index] = { ...postList.value[index], ...updatedPost };
  };
  const deletePost = (id: string) => {
    postList.value = postList.value.filter((r) => r.id !== id);
  };

  return {
    postList,
    nextCursor,
    hasMore,
    initialisePaginationData,
    pushPosts,
    createPost,
    updatePost,
    deletePost,
  };
});
