import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

// The two marks every editor menu here offers, in the order both menus draw them.
export const getTextFormatMenuItems = (editor: Editor | undefined): MenuItem[] => [
  {
    active: editor?.isActive("bold"),
    icon: "mdi-format-bold",
    onClick: () => {
      editor?.chain().focus().toggleBold().run();
    },
    title: "Bold",
  },
  {
    active: editor?.isActive("italic"),
    icon: "mdi-format-italic",
    onClick: () => {
      editor?.chain().focus().toggleItalic().run();
    },
    title: "Italic",
  },
];
