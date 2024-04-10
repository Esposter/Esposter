import { items } from "@/assets/dungeons/data/items";
import type { ItemId } from "@/models/dungeons/item/ItemId";

export const getItem = (itemId: ItemId) => items.find((i) => i.id === itemId);
