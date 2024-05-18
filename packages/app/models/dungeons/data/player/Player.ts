import { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "@/models/dungeons/data/player/Direction";
import { inventorySchema } from "@/models/dungeons/data/player/Inventory";
import { positionSchema } from "@/models/dungeons/data/player/Position";
import { RespawnLocation, respawnLocationSchema } from "@/models/dungeons/data/player/RespawnLocation";
import type { Item } from "@/models/dungeons/item/Item";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { Monster, monsterSchema } from "@/models/dungeons/monster/Monster";
import { getItem } from "@/services/dungeons/item/getItem";
import { getInitialMetadata } from "@/services/dungeons/scene/world/TilemapInitialPositionMap";
import type { Direction, Position } from "grid-engine";
import { z } from "zod";

export class Player {
  position: Position;
  direction: Direction;
  monsters: Monster[] = [new Monster(MonsterKey.Iguanignite)];
  inventory: Item[] = [{ id: ItemId.Potion, quantity: 10 }].map(({ id, ...rest }) => ({ ...getItem(id), ...rest }));
  respawnLocation = new RespawnLocation();

  constructor() {
    const { position, direction } = getInitialMetadata(TilemapKey.Home);
    this.position = position;
    this.direction = direction;
  }
}

export const playerSchema = z.object({
  position: positionSchema,
  direction: directionSchema,
  monsters: z.array(monsterSchema),
  inventory: inventorySchema,
  respawnLocation: respawnLocationSchema,
}) satisfies z.ZodType<Player>;
