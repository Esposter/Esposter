import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { CUSTOM_EMOJI_ID_ATTRIBUTE, CUSTOM_EMOJI_NAME_ATTRIBUTE, CUSTOM_EMOJI_TYPE } from "@esposter/shared";
import { mergeAttributes, Node } from "@tiptap/vue-3";
// An atom, like a mention: one indivisible thing in the document carrying only what identifies it. The node
// Serializes its id and name and never a url — the image is a short-lived read SAS resolved when the message is
// Rendered, so storing one would persist a credential that expires. Its text content is the shortcode, which is
// What the composer shows while typing and what a reader sees if the emoji is ever deleted
const CustomEmojiNode = Node.create({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute(CUSTOM_EMOJI_ID_ATTRIBUTE),
        renderHTML: (attributes) => (attributes.id ? { [CUSTOM_EMOJI_ID_ATTRIBUTE]: attributes.id } : {}),
      },
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute(CUSTOM_EMOJI_NAME_ATTRIBUTE),
        renderHTML: (attributes) => (attributes.name ? { [CUSTOM_EMOJI_NAME_ATTRIBUTE]: attributes.name } : {}),
      },
    };
  },

  atom: true,

  group: "inline",

  inline: true,

  name: CUSTOM_EMOJI_TYPE,

  parseHTML() {
    return [{ tag: `span[${CUSTOM_EMOJI_ID_ATTRIBUTE}]` }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["span", mergeAttributes(HTMLAttributes), getEmojiShortcode(String(node.attrs.name ?? ""))];
  },
});

export const useCustomEmojiExtension = () => CustomEmojiNode;
