// @unocss-include
import type { NoteSlashItem } from "#src/models/resource/note/NoteSlashItem";
import type { Item } from "#src/models/shared/Item";
import type { MenuItem } from "#src/models/shared/MenuItem";
import type { Editor } from "@tiptap/core";

import { getNoteBlockMenuItems } from "#src/services/resource/note/getNoteBlockMenuItems";
import { NoteSlashAliasMap } from "#src/services/resource/note/NoteSlashAliasMap";
import { getListMenuItems } from "#src/services/richTextEditor/getListMenuItems";
import { checkIsDivider } from "#src/services/shared/checkIsDivider";

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
