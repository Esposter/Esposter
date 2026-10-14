// @unocss-include
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { getListMenuItems } from "@/services/richTextEditor/getListMenuItems";
import { getTextFormatMenuItems } from "@/services/richTextEditor/getTextFormatMenuItems";

// The rich text menu bar's items: the marks, the lists, then undo and redo, split into the three groups it draws.
export const getRichTextMenuItems = (editor: Editor | undefined): MenuItem[] => [
  ...getTextFormatMenuItems(editor),
  {
    active: editor?.isActive("strike"),
    icon: "i-mdi:format-strikethrough-variant",
    onClick: () => {
      editor?.chain().focus().toggleStrike().run();
    },
    title: "Strike",
  },
  { isDivider: true },
  ...getListMenuItems(editor),
  { isDivider: true },
  {
    disabled: !editor?.can().undo(),
    icon: "i-mdi:undo",
    onClick: () => {
      editor?.chain().focus().undo().run();
    },
    title: "Undo",
  },
  {
    disabled: !editor?.can().redo(),
    icon: "i-mdi:redo",
    onClick: () => {
      editor?.chain().focus().redo().run();
    },
    title: "Redo",
  },
];
