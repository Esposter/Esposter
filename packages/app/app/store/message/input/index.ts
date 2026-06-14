import type { Editor } from "@tiptap/core";

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
  const initializeDraftRoomIds = (): Set<string> => {
    if (getIsServer()) return new Set();
    const ids = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(DRAFT_KEY_PREFIX)) continue;
      const roomId = key.slice(DRAFT_KEY_PREFIX.length);
      const draft = getDraft(roomId);
      if (!draft || EMPTY_TEXT_REGEX.test(draft.content)) continue;
      const sanitizedContent = setDraft(roomId, draft.content).content;
      if (EMPTY_TEXT_REGEX.test(sanitizedContent)) {
        removeDraft(roomId);
        continue;
      }
      setInput(roomId, sanitizedContent);
      ids.add(roomId);
    }
    return ids;
  };

  const draftRoomIds = ref(initializeDraftRoomIds());
  const storeDraft = (roomId: string, content: string) => {
    if (getIsServer()) return;
    const draft = setDraft(roomId, content);
    if (EMPTY_TEXT_REGEX.test(draft.content)) {
      removeDraft(roomId);
      setInput(roomId, "");
      if (draftRoomIds.value.has(roomId)) {
        const updatedDraftRoomIds = new Set(draftRoomIds.value);
        updatedDraftRoomIds.delete(roomId);
        draftRoomIds.value = updatedDraftRoomIds;
      }
      return;
    }

    setInput(roomId, draft.content);
    if (!draftRoomIds.value.has(roomId)) draftRoomIds.value = new Set([...draftRoomIds.value, roomId]);
  };

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId]) => {
      if (!roomId) return;
      if (newInput && !EMPTY_TEXT_REGEX.test(newInput)) {
        const draft = setDraft(roomId, newInput);
        if (EMPTY_TEXT_REGEX.test(draft.content)) {
          removeDraft(roomId);
          if (draftRoomIds.value.has(roomId)) {
            const updatedDraftRoomIds = new Set(draftRoomIds.value);
            updatedDraftRoomIds.delete(roomId);
            draftRoomIds.value = updatedDraftRoomIds;
          }
        } else if (!draftRoomIds.value.has(roomId)) draftRoomIds.value = new Set([...draftRoomIds.value, roomId]);
      } else {
        removeDraft(roomId);
        if (draftRoomIds.value.has(roomId)) {
          const updatedDraftRoomIds = new Set(draftRoomIds.value);
          updatedDraftRoomIds.delete(roomId);
          draftRoomIds.value = updatedDraftRoomIds;
        }
      }
    },
    { debounce: dayjs.duration(0.3, "seconds").asMilliseconds() },
  );

  const clearDraft = (roomId: string) => {
    removeDraft(roomId);
    const updatedDraftRoomIds = new Set(draftRoomIds.value);
    updatedDraftRoomIds.delete(roomId);
    draftRoomIds.value = updatedDraftRoomIds;
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
    draftRoomIds,
    input,
    storeDraft,
    validateInput,
  };
});
