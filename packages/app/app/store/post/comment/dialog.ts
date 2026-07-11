import type { PostWithRelations } from "@esposter/db-schema";

export const useCommentDialogStore = defineStore("post/comment/dialog", () => {
  const deletingId = ref<PostWithRelations["id"]>("");
  return {
    deletingId,
  };
});
