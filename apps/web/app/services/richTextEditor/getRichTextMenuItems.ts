// @unocss-include
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getTextFormatMenuItems } from "#src/services/richTextEditor/getTextFormatMenuItems";

// The rich text menu bar's items: the marks, then undo and redo. The lists are the bar's overflow menu's, beside it.
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
  {
    disabled: !editor?.can().undo(),
    isSelectionFree: true,
    meaning: UiIconMeaning.Undo,
    onClick: () => {
      editor?.chain().focus().undo().run();
    },
    title: "Undo",
  },
  {
    disabled: !editor?.can().redo(),
    isSelectionFree: true,
    meaning: UiIconMeaning.Redo,
    onClick: () => {
      editor?.chain().focus().redo().run();
    },
    title: "Redo",
  },
];
