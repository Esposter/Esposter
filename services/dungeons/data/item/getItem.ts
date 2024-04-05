import { items } from "@/assets/dungeons/data/items";
import type { ItemId } from "@/models/dungeons/item/ItemId";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const getItem = (itemId: ItemId) => items.find((i) => i.id === itemId);
