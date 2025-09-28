import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { useRoomStore } from "@/store/message/room";
import { parse } from "node-html-parser";

export const useRefreshMentions = (message: ReadonlyRefOrGetter<string>) => {
  const roomStore = useRoomStore();
  const { memberMap } = storeToRefs(roomStore);
  return computed(() => {
    const messageHtml = parse(toValue(message));
    const mentions = messageHtml.querySelectorAll("span[data-type='mention']");

    for (const mention of mentions) {
      const memberId = mention.getAttribute("data-id");
      if (!memberId) continue;
      const member = memberMap.value.get(memberId);
      if (!member?.name || member.name === mention.textContent.slice(1)) continue;

      mention.textContent = `@${member.name}`;
      mention.setAttribute("data-label", member.name);
    }

    return messageHtml.toString();
  });
};
