import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { escapeHtml } from "@/util/text/escapeHtml";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";
import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_LABEL_ATTRIBUTE,
  MENTION_SELECTOR,
} from "@esposter/shared";
import { parse } from "node-html-parser";

// Rendered message content, resolved against what only the reader's client knows: a mention shows the display
// Name this room calls that member, and a custom emoji shows the image its id names. One parse and one pass per
// Rewrite (/docs/architecture/content-token-rewriting) — the tree that is queried has to be the tree that is
// Serialized, or the mutations are made to a copy nobody reads
export const useMessageHtml = (message: MaybeRefOrGetter<string>, roomId?: MaybeRefOrGetter<string>) => {
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  const roomEmojiStore = useRoomEmojiStore();
  const { customEmojiMap } = storeToRefs(roomEmojiStore);
  return computed(() => {
    const messageHtml = parse(toValue(message));
    const roomIdValue = roomId ? toValue(roomId) : undefined;

    for (const mention of messageHtml.querySelectorAll(MENTION_SELECTOR)) {
      const memberId = mention.getAttribute(MENTION_ID_ATTRIBUTE);
      if (!memberId) continue;
      const member = userMap.value.get(memberId);
      if (!member) continue;
      const displayName = roomIdValue ? getDisplayName(member, roomIdValue) : member.name;
      if (displayName === mention.textContent.slice(1)) continue;

      mention.textContent = `@${displayName}`;
      mention.setAttribute(MENTION_LABEL_ATTRIBUTE, displayName);
    }

    for (const customEmoji of messageHtml.querySelectorAll(`span[${CUSTOM_EMOJI_ID_ATTRIBUTE}]`)) {
      const id = customEmoji.getAttribute(CUSTOM_EMOJI_ID_ATTRIBUTE);
      const roomEmoji = id ? customEmojiMap.value.get(id) : undefined;
      // An emoji the room no longer has resolves to nothing, and the node's own shortcode text is left exactly
      // As it was authored — one unresolvable emoji never fails the render of the message around it
      if (!roomEmoji) continue;

      const shortcode = getEmojiShortcode(roomEmoji.name);
      customEmoji.set_content(`<img class="custom-emoji" src="${escapeHtml(roomEmoji.sasUrl)}" alt="${shortcode}" />`);
    }

    return messageHtml.toString();
  });
};
