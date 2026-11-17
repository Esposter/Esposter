// @unocss-include
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

// The three marks every editor menu here offers, in the order each menu draws them.
export const getTextFormatMenuItems = (editor: Editor | undefined): MenuItem[] => [
  {
    active: editor?.isActive("bold"),
    icon: "i-mdi:format-bold",
    onClick: () => {
      editor?.chain().focus().toggleBold().run();
    },
    title: "Bold",
  },
  {
    active: editor?.isActive("italic"),
    icon: "i-mdi:format-italic",
    onClick: () => {
      editor?.chain().focus().toggleItalic().run();
    },
    title: "Italic",
  },
  {
    active: editor?.isActive("code"),
    icon: "i-mdi:code-tags",
    onClick: () => {
      editor?.chain().focus().toggleCode().run();
    },
    title: "Code",
  },
];
