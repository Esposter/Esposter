import type { PostInPostWithRelations } from "@esposter/db-schema";

export const useCommentDialogStore = defineStore("post/comment/dialog", () => {
  const deletingId = ref<PostInPostWithRelations["id"]>("");
  // The branch the target is filed under, so the one dialog serving a whole tree resolves it against one list
  const deletingParentId = ref<PostInPostWithRelations["id"]>("");
  const replyingId = ref<PostInPostWithRelations["id"]>("");
  const setDeletingComment = ({ id, parentId }: Pick<PostInPostWithRelations, "id" | "parentId">) => {
    deletingParentId.value = parentId ?? "";
    deletingId.value = id;
  };
  return { deletingId, deletingParentId, replyingId, setDeletingComment };
});
