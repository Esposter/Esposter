// @unocss-include
import type { NoteSlashItem } from "@/models/resource/note/NoteSlashItem";
import type { Item } from "@/models/shared/Item";
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { getNoteBlockMenuItems } from "@/services/resource/note/getNoteBlockMenuItems";
import { NoteSlashAliasMap } from "@/services/resource/note/NoteSlashAliasMap";
import { getListMenuItems } from "@/services/richTextEditor/getListMenuItems";
import { checkIsDivider } from "@/services/shared/checkIsDivider";

// The blocks the slash menu inserts: the Note's menu items and the list items the composer shares, read off the menus
// Rather than listed again, plus the two blocks only the slash menu offers
export const getNoteSlashItems = (editor: Editor): NoteSlashItem[] => {
  const menuItems: MenuItem[] = [
    ...getNoteBlockMenuItems(editor),
    ...getListMenuItems(editor),
    {
      icon: "i-mdi:code-braces",
      onClick: () => {
        editor.chain().focus().toggleCodeBlock().run();
      },
      title: "Code Block",
    },
    {
      icon: "i-mdi:minus",
      onClick: () => {
        editor.chain().focus().setHorizontalRule().run();
      },
      title: "Divider",
    },
  ];
  return menuItems
    .filter((menuItem): menuItem is Item => !checkIsDivider(menuItem))
    .map((item) => Object.assign(item, { aliases: NoteSlashAliasMap[item.title] ?? [] }));
};
