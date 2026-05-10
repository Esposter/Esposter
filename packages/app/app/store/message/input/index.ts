import type { Editor } from "@tiptap/core";

import { dayjs } from "#shared/services/dayjs";
import { validateFile } from "@/services/file/validateFile";
import { DRAFT_KEY_PREFIX } from "@/store/message/input/constants";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { getIsServer } from "@esposter/shared";

export const useInputStore = defineStore("message/input", () => {
  const roomStore = useRoomStore();
  const { data: input, setData } = useDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();

  const initDraftRoomIds = (): Set<string> => {
    if (getIsServer()) return new Set();
    const ids = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(DRAFT_KEY_PREFIX)) continue;
      const content = localStorage.getItem(key);
      if (!content || EMPTY_TEXT_REGEX.test(content)) continue;
      const roomId = key.slice(DRAFT_KEY_PREFIX.length);
      setData(roomId, content);
      ids.add(roomId);
    }
    return ids;
  };

  const draftRoomIds = ref(initDraftRoomIds());

  watchDebounced(
    () => [input.value, roomStore.currentRoomId] as const,
    ([newInput, roomId]) => {
      if (!roomId) return;
      const key = `${DRAFT_KEY_PREFIX}${roomId}`;
      const hasDraft = Boolean(newInput && !EMPTY_TEXT_REGEX.test(newInput));
      if (hasDraft) {
        localStorage.setItem(key, newInput);
        if (!draftRoomIds.value.has(roomId)) draftRoomIds.value = new Set([...draftRoomIds.value, roomId]);
      } else {
        localStorage.removeItem(key);
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
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${roomId}`);
    const updatedDraftRoomIds = new Set(draftRoomIds.value);
    updatedDraftRoomIds.delete(roomId);
    draftRoomIds.value = updatedDraftRoomIds;
    setData(roomId, "");
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
    validateInput,
  };
});
