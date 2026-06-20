import type { Editor } from "@tiptap/core";
import type { Draft } from "@/models/message/Draft";

import { dayjs } from "#shared/services/dayjs";
import { validateFile } from "@/services/file/validateFile";
import { DRAFT_KEY_PREFIX } from "@/services/message/draft/constants";
import { getDraft } from "@/services/message/draft/getDraft";
import { removeDraft } from "@/services/message/draft/removeDraft";
import { setDraft } from "@/services/message/draft/setDraft";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { getIsServer } from "@esposter/shared";

export const useInputStore = defineStore("message/input", () => {
  const roomStore = useRoomStore();
  const { data: input, setData: setInput } = useDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();
  const initializeDrafts = (): Map<string, Draft> => {
    if (getIsServer()) return new Map();
    const drafts = new Map<string, Draft>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(DRAFT_KEY_PREFIX)) continue;
      const roomId = key.slice(DRAFT_KEY_PREFIX.length);
      const draft = getDraft(roomId);
      if (!draft || EMPTY_TEXT_REGEX.test(draft.content)) continue;
      const sanitizedDraft = setDraft(roomId, draft.content);
      if (EMPTY_TEXT_REGEX.test(sanitizedDraft.content)) {
        removeDraft(roomId);
        continue;
      }
      setInput(roomId, sanitizedDraft.content);
      drafts.set(roomId, sanitizedDraft);
    }
    return drafts;
  };

  const drafts = ref(initializeDrafts());
  const storeDraft = (roomId: string, content: string) => {
    if (getIsServer()) return;
    const draft = setDraft(roomId, content);
    if (EMPTY_TEXT_REGEX.test(draft.content)) {
      removeDraft(roomId);
      setInput(roomId, "");
      drafts.value.delete(roomId);
      return;
    }

    setInput(roomId, draft.content);
    drafts.value.set(roomId, draft);
  };

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId]) => {
      if (!roomId) return;
      if (newInput && !EMPTY_TEXT_REGEX.test(newInput)) {
        const draft = setDraft(roomId, newInput);
        if (EMPTY_TEXT_REGEX.test(draft.content)) {
          removeDraft(roomId);
          drafts.value.delete(roomId);
        } else drafts.value.set(roomId, draft);
      } else {
        removeDraft(roomId);
        drafts.value.delete(roomId);
      }
    },
    { debounce: dayjs.duration(0.3, "seconds").asMilliseconds() },
  );

  const clearDraft = (roomId: string) => {
    removeDraft(roomId);
    drafts.value.delete(roomId);
    setInput(roomId, "");
  };

  const validateInput = (editor?: Editor, isDisplayError?: true) => {
    if (isDisplayError && !uploadFileStore.files.every(({ size }) => validateFile(size))) {
      useEmptyFileAlert();
      return false;
    } else
      return (
        !uploadFileStore.isFileLoading &&
        (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || uploadFileStore.files.length > 0)
      );
  };

  return {
    clearDraft,
    drafts,
    input,
    storeDraft,
    validateInput,
  };
});
