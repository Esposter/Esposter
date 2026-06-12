import type { Editor } from "@tiptap/core";

import { dayjs } from "#shared/services/dayjs";
import { validateFile } from "@/services/file/validateFile";
import { DRAFT_KEY_PREFIX, DRAFT_UPDATED_AT_KEY_PREFIX } from "@/store/message/input/constants";
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
      const draft = localStorage.getItem(key);
      if (!draft || EMPTY_TEXT_REGEX.test(draft)) continue;
      const roomId = key.slice(DRAFT_KEY_PREFIX.length);
      setInput(roomId, draft);
      ids.add(roomId);
    }
    return ids;
  };

  const draftRoomIds = ref(initializeDraftRoomIds());
  const getDraft = (roomId: string) =>
    getIsServer() ? "" : (localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId}`) ?? "");
  const getDraftUpdatedAt = (roomId: string) => {
    const value = getIsServer() ? undefined : localStorage.getItem(`${DRAFT_UPDATED_AT_KEY_PREFIX}${roomId}`);
    return value ? new Date(value) : undefined;
  };
  const storeDraft = (roomId: string, draft: string) => {
    if (getIsServer()) return;
    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId}`, draft);
    localStorage.setItem(`${DRAFT_UPDATED_AT_KEY_PREFIX}${roomId}`, new Date().toISOString());
    setInput(roomId, draft);
    if (!draftRoomIds.value.has(roomId)) draftRoomIds.value = new Set([...draftRoomIds.value, roomId]);
  };

  watchDebounced(
    () => [input.value, roomStore.currentRoomId],
    ([newInput, roomId]) => {
      if (!roomId) return;
      const key = `${DRAFT_KEY_PREFIX}${roomId}`;
      if (newInput && !EMPTY_TEXT_REGEX.test(newInput)) {
        localStorage.setItem(key, newInput);
        localStorage.setItem(`${DRAFT_UPDATED_AT_KEY_PREFIX}${roomId}`, new Date().toISOString());
        if (!draftRoomIds.value.has(roomId)) draftRoomIds.value = new Set([...draftRoomIds.value, roomId]);
      } else {
        localStorage.removeItem(key);
        localStorage.removeItem(`${DRAFT_UPDATED_AT_KEY_PREFIX}${roomId}`);
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
    localStorage.removeItem(`${DRAFT_UPDATED_AT_KEY_PREFIX}${roomId}`);
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
    getDraft,
    getDraftUpdatedAt,
    input,
    storeDraft,
    validateInput,
  };
});
