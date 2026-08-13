import type { MessageEntity } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";
import { useAppUserStore } from "@/store/message/user/appUser";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return undefined;

    if (messageValue.type === MessageType.Webhook) {
      // An app user is not a member of the room, so it has no nickname to resolve
      const appUser = appUserMap.value.get(messageValue.appUser.id);
      return appUser ? { ...appUser, ...messageValue.appUser } : undefined;
    }

    const user = userMap.value.get(messageValue.userId);
    if (!user) return undefined;

    // The creator is named on every message it wrote, so it resolves the room nickname exactly like the member
    // Sidebar and the settings Members panel — otherwise a renamed member is two different people in one room
    return { ...user, name: getDisplayName(user, messageValue.partitionKey) };
  });
};
