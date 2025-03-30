import { useMemberStore } from "@/store/esbabbler/member";
import { parse } from "node-html-parser";

export const useRefreshMentions = (message: string) => {
  const memberStore = useMemberStore();
  const { memberList } = storeToRefs(memberStore);
  const messageHtml = parse(message);
  const mentions = messageHtml.querySelectorAll("span[data-type='mention']");

  for (const mention of mentions) {
    const memberId = mention.getAttribute("data-id");
    const member = memberList.value.find(({ id }) => id === memberId);
    if (!member?.name) continue;

    mention.textContent = `@${member.name}`;
    mention.setAttribute("data-label", member.name);
  }

  return messageHtml.toString();
};
