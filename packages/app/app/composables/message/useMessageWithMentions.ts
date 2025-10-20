import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { useMemberStore } from "@/store/message/user/member";
import { MENTION_ID_ATTRIBUTE, MENTION_LABEL_ATTRIBUTE } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageWithMentions = (message: ReadonlyRefOrGetter<string>) => {
  const memberStore = useMemberStore();
  const { memberMap } = storeToRefs(memberStore);
  const mentions = useMentions(message);
  return computed(() => {
    const messageHtml = parse(toValue(message));

    for (const mention of mentions.value) {
      const memberId = mention.getAttribute(MENTION_ID_ATTRIBUTE);
      if (!memberId) continue;
      const member = memberMap.value.get(memberId);
      if (!member?.name || member.name === mention.textContent.slice(1)) continue;

      mention.textContent = `@${member.name}`;
      mention.setAttribute(MENTION_LABEL_ATTRIBUTE, member.name);
    }

    return messageHtml.toString();
  });
};
