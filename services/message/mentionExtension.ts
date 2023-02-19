import { suggestion } from "@/services/message/suggestion";
import Mention from "@tiptap/extension-mention";

export const mentionExtension = Mention.configure({ HTMLAttributes: { class: "mention" }, suggestion });
