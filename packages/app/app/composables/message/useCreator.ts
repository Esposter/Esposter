import type { MessageEntity } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity>) => {
  const roomStore = useRoomStore();
  const { appUserMap, memberMap } = storeToRefs(roomStore);
  const creator = computed(() => {
    const messageValue = toValue(message);
    if (messageValue.type === MessageType.Webhook) {
      const appUser = appUserMap.value.get(messageValue.appUser.id);
      return appUser ? { ...appUser, ...messageValue.appUser } : undefined;
    } else return memberMap.value.get(messageValue.userId);
  });
  return creator;
};
