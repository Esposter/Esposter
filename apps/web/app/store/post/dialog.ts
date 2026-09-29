import type { PostInPostWithRelations } from "@esposter/db-schema";

export const usePostDialogStore = defineStore("post/dialog", () => {
  const deletingId = ref<PostInPostWithRelations["id"]>("");
  return { deletingId };
});
