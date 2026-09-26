import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { StandardCreateMessageInput } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { MentionExtension } from "@/services/message/MentionExtension";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/input/reply";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { MessageType } from "@esposter/db-schema";

// Everything a composer needs that does not depend on which composer it is — the room's and the thread pane's
// Differ only in their target, the room's extra slash-command extension, and the header above the editor
export const useComposer = async (target: MaybeRefOrGetter<ComposerTarget>) => {
  const dataStore = useDataStore();
  const { sendMessage } = dataStore;
  const inputStore = useInputStore();
  const { checkIsInputValid, getComposerInput } = inputStore;
  const uploadFileStore = useUploadFileStore();
  const { getComposerFiles } = uploadFileStore;
  const replyStore = useReplyStore();
  // One send for both composers: the room's own, and the thread pane's, which differ only in whose text and
  // Attachments they take and in what the reply points at. A pane send always replies to the thread root — that
  // Is what puts it in the thread rather than merely in the room — where the room composer replies to whatever
  // The user last picked Reply on, if anything
  const sendComposerMessage = async (editor: Editor, composerTarget: ComposerTarget) => {
    const { roomId, threadRootRowKey } = composerTarget;
    if (!roomId || !checkIsInputValid(composerTarget, editor, true)) return;

    const input: StandardCreateMessageInput = {
      files: getComposerFiles(composerTarget),
      message: getComposerInput(composerTarget),
      replyRowKey: threadRootRowKey || replyStore.rowKey,
      roomId,
      type: MessageType.Message,
    };
    await sendMessage(input, editor, composerTarget);
  };
  const keyboardExtension = await useKeyboardShortcutsExtension((editor) =>
    sendComposerMessage(editor, toValue(target)),
  );
  const codeBlockExtension = useCodeBlockExtension();
  const emojiExtension = useEmojiExtension();
  const customEmojiExtension = useCustomEmojiExtension();
  // The mention extension restyles itself from the theme, so the stack is a computed rather than a fixed array
  const extensions = computed(() => [
    keyboardExtension,
    codeBlockExtension,
    emojiExtension,
    customEmojiExtension,
    MentionExtension,
  ]);
  return { checkIsInputValid, extensions, sendComposerMessage, uploadFiles: useUploadFiles(target) };
};
