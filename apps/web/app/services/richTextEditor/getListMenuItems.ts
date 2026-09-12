import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

// The two list nodes every editor menu here offers, in the order both menus draw them.
export const getListMenuItems = (editor: Editor | undefined): MenuItem[] => [
  {
    active: editor?.isActive("bulletList"),
    icon: "mdi-format-list-bulleted",
    onClick: () => {
      editor?.chain().focus().toggleBulletList().run();
    },
    title: "Bullet List",
  },
  {
    active: editor?.isActive("orderedList"),
    icon: "mdi-format-list-numbered",
    onClick: () => {
      editor?.chain().focus().toggleOrderedList().run();
    },
    title: "Ordered List",
  },
];
