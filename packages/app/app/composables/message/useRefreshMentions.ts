import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { useMessageStore } from "@/store/message";
import { parse } from "node-html-parser";

export const useRefreshMentions = (message: ReadonlyRefOrGetter<string>) => {
  const messageStore = useMessageStore();
  const { userMap } = storeToRefs(messageStore);
  return computed(() => {
    const messageHtml = parse(toValue(message));
    const mentions = messageHtml.querySelectorAll("span[data-type='mention']");

    for (const mention of mentions) {
      const memberId = mention.getAttribute("data-id");
      if (!memberId) continue;
      const member = userMap.value.get(memberId);
      if (!member?.name || member.name === mention.textContent.slice(1)) continue;

      mention.textContent = `@${member.name}`;
      mention.setAttribute("data-label", member.name);
    }

    return messageHtml.toString();
  });
};
