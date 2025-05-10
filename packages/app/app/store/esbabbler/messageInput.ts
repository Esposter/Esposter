import type { ParsedFileEntity } from "@/models/esbabbler/file/ParsedFileEntity";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const { data: files } = createDataMap<ParsedFileEntity[]>(() => roomStore.currentRoomId, []);
  const replyRowKey = ref<string>();
  const forwardRowKey = ref<string>();
  const forwardRoomIds = ref<string[]>([]);
  return { files, forwardRoomIds, forwardRowKey, messageInput, replyRowKey };
});
