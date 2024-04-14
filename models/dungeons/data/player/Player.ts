import { directionSchema } from "@/models/dungeons/data/player/Direction";
import { inventorySchema } from "@/models/dungeons/data/player/Inventory";
import { positionSchema } from "@/models/dungeons/data/player/Position";
import type { Item } from "@/models/dungeons/item/Item";
import { ItemId } from "@/models/dungeons/item/ItemId";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { monsterSchema } from "@/models/dungeons/monster/Monster";
import { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { getItem } from "@/services/dungeons/item/getItem";
import { getMonster } from "@/services/dungeons/monster/getMonster";
import { INITIAL_POSITION } from "@/services/dungeons/world/home/constants";
import { Direction } from "grid-engine";
import { z } from "zod";

export class Player {
  position = INITIAL_POSITION;
  direction = Direction.DOWN;
  monsters: Monster[] = [
    {
      id: crypto.randomUUID(),
      ...getMonster(MonsterName.Iguanignite),
    },
  ];
  inventory: Item[] = [{ id: ItemId.Potion, quantity: 10 }].map(({ id, ...rest }) => ({ ...getItem(id), ...rest }));
}

export const playerSchema = z.object({
  position: positionSchema,
  direction: directionSchema,
  monsters: z.array(monsterSchema),
  inventory: inventorySchema,
}) satisfies z.ZodType<Player>;
