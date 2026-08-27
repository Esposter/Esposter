import type { PostWithRelations } from "@esposter/db-schema";

export const useCommentDialogStore = defineStore("post/comment/dialog", () => {
  const deletingId = ref<PostWithRelations["id"]>("");
  // The branch the target is filed under, so the one dialog serving a whole tree resolves it against one list
  const deletingParentId = ref<PostWithRelations["id"]>("");
  const replyingId = ref<PostWithRelations["id"]>("");
  const setDeletingComment = ({ id, parentId }: Pick<PostWithRelations, "id" | "parentId">) => {
    deletingParentId.value = parentId ?? "";
    deletingId.value = id;
  };
  return {
    deletingId,
    deletingParentId,
    replyingId,
    setDeletingComment,
  };
});
