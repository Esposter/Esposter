import { type MessageMetadataEntity } from "@/models/esbabbler/message/metadata";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageMetadataMap = <T extends MessageMetadataEntity>() => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  // Record<partitionKey, Record<messageRowKey, T[]>>
  const metadataMap = ref<Record<string, Record<string, T[]>>>({});
  const getMetadataList = (messageRowKey: string) => {
    if (!currentRoomId.value || !metadataMap.value[currentRoomId.value]?.[messageRowKey]) return [];
    return metadataMap.value[currentRoomId.value][messageRowKey];
  };
  const setMetadataList = (messageRowKey: string, metadatas: T[]) => {
    if (!currentRoomId.value) return;
    metadataMap.value[currentRoomId.value] = {
      ...metadataMap.value[currentRoomId.value],
      [messageRowKey]: metadatas,
    };
  };
  return {
    getMetadataList,
    setMetadataList,
  };
};
