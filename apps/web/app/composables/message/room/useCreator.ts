import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Creator } from "#src/models/message/Creator";

import { UNKNOWN_CREATOR } from "#src/services/message/constants";
import { useAppUserStore } from "#src/store/message/user/appUser";
import { useUserStore } from "#src/store/message/user/index";

// A message with no creator to name is undefined, and one with a message always has a creator, placeholder or not
export function useCreator(message: MaybeRefOrGetter<ClientMessage>): ComputedRef<Creator>;
export function useCreator(message: MaybeRefOrGetter<ClientMessage | undefined>): ComputedRef<Creator | undefined>;
export function useCreator(message: MaybeRefOrGetter<ClientMessage | undefined>) {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { getRoomMemberName } = userStore;
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return undefined;

    if (messageValue.appUserId)
    // An app user is not a member of the room, so it has no room display name to resolve. The identity its message
    // Carries wins over the cache, so a webhook the cache never held is still named, and a delivery that carried none
    // Falls back to the bot's stored name and image
    {
      const appUser = appUserMap.value.get(messageValue.appUserId);
      return {
        ...UNKNOWN_CREATOR,
        ...appUser,
        id: messageValue.appUserId,
        image: messageValue.appUserImage || appUser?.image || UNKNOWN_CREATOR.image,
        name: messageValue.senderName || appUser?.name || UNKNOWN_CREATOR.name,
      };
    }

    const { userId } = messageValue;
    if (!userId) return undefined;

    const user = userMap.value.get(userId);
    // The creator is named on every message it wrote, so it takes the room display name its member row carries,
    // Exactly like the member sidebar and the settings Members panel — otherwise a renamed member is two people in one room
    if (user) return { ...user, name: getRoomMemberName(messageValue.roomId, user.id) };
    // An author nobody can resolve is drawn under the placeholder, so a message is never dropped for want of its author
    else return { ...UNKNOWN_CREATOR, id: userId };
  });
}
