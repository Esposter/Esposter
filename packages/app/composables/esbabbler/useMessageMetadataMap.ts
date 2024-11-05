import type { MessageMetadataEntity } from "@/shared/models/esbabbler/message/metadata";

import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageMetadataMap = <T extends MessageMetadataEntity>() => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  // Map<partitionKey, Map<messageRowKey, T[]>>
  const metadataMap: Ref<Map<string, Map<string, T[]>>> = ref(new Map());
  const getMetadataList = (messageRowKey: string) => {
    if (!currentRoomId.value) return [];
    const metadataList = metadataMap.value.get(currentRoomId.value)?.get(messageRowKey);
    return metadataList ?? [];
  };
  const setMetadataList = (messageRowKey: string, metadataList: T[]) => {
    if (!currentRoomId.value) return;
    const newMap = metadataMap.value.get(currentRoomId.value) ?? new Map<string, T[]>();
    newMap.set(messageRowKey, metadataList);
    metadataMap.value.set(currentRoomId.value, newMap);
  };
  return {
    getMetadataList,
    setMetadataList,
  };
};
