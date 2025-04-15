import { useMemberStore } from "@/store/esbabbler/member";
import { parse } from "node-html-parser";

export const useRefreshMentions = (message: MaybeRefOrGetter<string>) => {
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  return computed(() => {
    const messageHtml = parse(toValue(message));
    const mentions = messageHtml.querySelectorAll("span[data-type='mention']");

    for (const mention of mentions) {
      const memberId = mention.getAttribute("data-id");
      const member = members.value.find(({ id }) => id === memberId);
      if (!member?.name) continue;

      mention.textContent = `@${member.name}`;
      mention.setAttribute("data-label", member.name);
    }

    return messageHtml.toString();
  });
};
