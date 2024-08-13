import type { MessageMetadataEntity } from "@/models/esbabbler/message/metadata";

import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageMetadataMap = <T extends MessageMetadataEntity>() => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  // Map<partitionKey, Map<messageRowKey, T[]>>
  // @TODO: Vue cannot unwrap generic refs yet
  const metadataMap = ref(new Map()) as Ref<Map<string, Map<string, T[]>>>;
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
