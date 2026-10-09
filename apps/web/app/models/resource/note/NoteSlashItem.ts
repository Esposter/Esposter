import type { Item } from "@/models/shared/Item";

// A block the slash menu offers: a menu item that also answers to the aliases a reader types, as `h1` finds Heading 1
export type NoteSlashItem = Item & { aliases: string[] };
