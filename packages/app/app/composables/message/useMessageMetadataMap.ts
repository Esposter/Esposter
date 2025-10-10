import type { MessageMetadataType } from "@esposter/db";

import { createAzureMetadataMap } from "@/services/shared/metadata/createAzureMetadataMap";
import { useRoomStore } from "@/store/message/room";

export const useMessageMetadataMap = <TType extends MessageMetadataType>(messageMetadataType: TType) => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  return createAzureMetadataMap(currentRoomId, messageMetadataType);
};
