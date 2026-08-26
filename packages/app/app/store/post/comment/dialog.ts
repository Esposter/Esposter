import type { PostWithRelations } from "@esposter/db-schema";

export const useCommentDialogStore = defineStore("post/comment/dialog", () => {
  const deletingId = ref<PostWithRelations["id"]>("");
  // The branch the target is filed under, written by the card that owns it. Without it the one dialog serving a
  // Whole tree would have to search every open branch to find one row — on every reactive change, since that is
  // How often it re-resolves its target
  const deletingParentId = ref<PostWithRelations["id"]>("");
  // One reply editor is open at a time, the same way one delete dialog is: a tree renders every node it has read,
  // And an editor per node is a form tree nobody asked for
  const replyingId = ref<PostWithRelations["id"]>("");
  return {
    deletingId,
    deletingParentId,
    replyingId,
  };
});
