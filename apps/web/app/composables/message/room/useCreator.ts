import type { MessageEntity } from "@esposter/db-schema";

import { UNKNOWN_USER_NAME } from "@/services/message/constants";
import { useUserStore } from "@/store/message/user";
import { useAppUserStore } from "@/store/message/user/appUser";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { getRoomMemberName } = userStore;
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return undefined;

    if (messageValue.type === MessageType.Webhook) {
      // An app user is not a member of the room, so it has no room display name to resolve. The identity its message
      // Carries wins over the cache, so a webhook the cache never held is still named
      const { id } = messageValue.appUser;
      return { id, image: "", name: UNKNOWN_USER_NAME, ...appUserMap.value.get(id), ...messageValue.appUser };
    }

    const user = userMap.value.get(messageValue.userId);
    // The creator is named on every message it wrote, so it takes the room display name its member row carries,
    // Exactly like the member sidebar and the settings Members panel — otherwise a renamed member is two people in one room
    if (user) return { ...user, name: getRoomMemberName(messageValue.partitionKey, user.id) };
    // An author nobody can resolve is drawn under the placeholder, so a message is never dropped for want of its author
    else return { id: messageValue.userId, image: "", name: UNKNOWN_USER_NAME };
  });
};
