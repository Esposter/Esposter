import { AttackId } from "@/models/dungeons/attack/AttackId";
import { directionSchema } from "@/models/dungeons/data/player/Direction";
import { inventorySchema } from "@/models/dungeons/data/player/Inventory";
import { positionSchema } from "@/models/dungeons/data/player/Position";
import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { Item } from "@/models/dungeons/item/Item";
import { ItemId } from "@/models/dungeons/item/ItemId";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { monsterSchema } from "@/models/dungeons/monster/Monster";
import { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { getItem } from "@/services/dungeons/item/getItem";
import { mapIds } from "@/util/mapIds";
import type { Position } from "grid-engine";
import { z } from "zod";

export class Player {
  position: Position = { x: 6, y: 21 };
  direction: InteractableDirection = InteractableDirection.DOWN;
  monsters: Monster[] = [
    {
      id: crypto.randomUUID(),
      name: MonsterName.Iguanignite,
      asset: {
        key: ImageKey.Iguanignite,
      },
      stats: {
        maxHp: 25,
        baseAttack: 5,
      },
      currentLevel: 5,
      currentHp: 25,
      attackIds: [AttackId.Slash],
    },
  ];
  inventory: Item[] = mapIds([{ id: ItemId.Potion, quantity: 10 }], ({ id, ...rest }) => {
    const item = getItem(id);
    return item ? { ...item, ...rest } : undefined;
  });
}

export const playerSchema = z.object({
  position: positionSchema,
  direction: directionSchema,
  monsters: z.array(monsterSchema),
  inventory: inventorySchema,
}) satisfies z.ZodType<Player>;
