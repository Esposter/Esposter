import type { MessageEntity } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";
import { useAppUserStore } from "@/store/message/user/appUser";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { getRoomMemberMap } = userStore;
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return undefined;

    if (messageValue.type === MessageType.Webhook) {
      // An app user is not a member of the room, so it has no room display name to resolve
      const appUser = appUserMap.value.get(messageValue.appUser.id);
      return appUser ? { ...appUser, ...messageValue.appUser } : undefined;
    }

    const user = userMap.value.get(messageValue.userId);
    // The creator is named on every message it wrote, so it takes the room display name its member row carries,
    // Exactly like the member sidebar and the settings Members panel — otherwise a renamed member is two people in one room
    if (user)
      return { ...user, name: getRoomMemberMap(messageValue.partitionKey)?.get(user.id)?.displayName ?? user.name };
    else return undefined;
  });
};
