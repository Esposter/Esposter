import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";
import { MENTION_ID_ATTRIBUTE, MENTION_LABEL_ATTRIBUTE } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageWithMentions = (message: MaybeRefOrGetter<string>, roomId?: MaybeRefOrGetter<string>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  const mentions = useMentions(message);
  return computed(() => {
    const messageHtml = parse(toValue(message));
    const roomIdValue = roomId ? toValue(roomId) : undefined;

    for (const mention of mentions.value) {
      const memberId = mention.getAttribute(MENTION_ID_ATTRIBUTE);
      if (!memberId) continue;
      const member = userMap.value.get(memberId);
      if (!member) continue;
      const displayName = roomIdValue ? getDisplayName(member, roomIdValue) : member.name;
      if (displayName === mention.textContent.slice(1)) continue;

      mention.textContent = `@${displayName}`;
      mention.setAttribute(MENTION_LABEL_ATTRIBUTE, displayName);
    }

    return messageHtml.toString();
  });
};
