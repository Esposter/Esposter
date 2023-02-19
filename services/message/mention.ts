import { suggestion } from "@/services/message/suggestion";
import { useMemberStore } from "@/store/chat/useMemberStore";
import Mention from "@tiptap/extension-mention";
import { parse } from "node-html-parser";

export const mentionExtension = Mention.configure({ HTMLAttributes: { class: "mention" }, suggestion });

export const refreshMentions = (message: string) => {
  const memberStore = useMemberStore();
  const { memberList } = storeToRefs(memberStore);
  const messageHtml = parse(message);
  const mentions = messageHtml.querySelectorAll("span[data-type='mention']");

  for (const mention of mentions) {
    const memberId = mention.getAttribute("data-id");
    const member = memberList.value.find((m) => m.id === memberId);
    if (!member?.name) continue;

    mention.textContent = `@${member.name}`;
    mention.setAttribute("data-label", member.name);
  }

  return messageHtml.toString();
};
