import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";

export const useIsMessageCreator = async (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const { data: session } = await authClient.useSession(useFetch);
  const roomStore = useRoomStore();
  const { isCreator } = storeToRefs(roomStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return false;
    return (
      (messageValue.type === MessageType.Message && messageValue.userId === session.value?.user.id) || isCreator.value
    );
  });
};
