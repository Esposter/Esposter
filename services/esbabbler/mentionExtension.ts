import { suggestion } from "@/services/esbabbler/suggestion";
import Mention from "@tiptap/extension-mention";

export const mentionExtension = Mention.configure({ HTMLAttributes: { class: "mention" }, suggestion });
