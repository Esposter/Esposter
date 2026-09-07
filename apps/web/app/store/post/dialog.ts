import type { PostWithRelations } from "@esposter/db-schema";

export const usePostDialogStore = defineStore("post/dialog", () => {
  const deletingId = ref<PostWithRelations["id"]>("");
  return {
    deletingId,
  };
});
