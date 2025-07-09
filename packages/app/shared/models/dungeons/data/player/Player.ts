import type { Item } from "#shared/models/dungeons/item/Item";
import type { Direction, Position } from "grid-engine";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "#shared/models/dungeons/data/player/Direction";
import { inventorySchema } from "#shared/models/dungeons/data/player/Inventory";
import { positionSchema } from "#shared/models/dungeons/data/player/Position";
import { RespawnLocation, respawnLocationSchema } from "#shared/models/dungeons/data/player/RespawnLocation";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { Monster, monsterSchema } from "#shared/models/dungeons/monster/Monster";
import { getItem } from "#shared/services/dungeons/item/getItem";
import { getInitialMetadata } from "#shared/services/dungeons/scene/world/getInitialMetadata";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { z } from "zod";

export class Player {
  direction: Direction;
  inventory: Item[] = [
    { id: ItemId.Potion, quantity: 10 },
    { id: ItemId.DamagedBall, quantity: 5 },
  ].map(({ id, ...rest }) => ({ ...getItem(id), ...rest }));
  monsters: Monster[] = (() => {
    if (IS_DEVELOPMENT) {
      const monsters = [
        new Monster(MonsterKey.Iguanignite),
        new Monster(MonsterKey.Carnodusk),
        new Monster(MonsterKey.Ignivolt),
      ];
      for (const monster of monsters) {
        monster.stats.attack = 100;
        monster.status.hp = 5;
      }
      return monsters;
    }
    return [new Monster(MonsterKey.Iguanignite)];
  })();
  position: Position;
  respawnLocation = new RespawnLocation();

  constructor() {
    const { direction, position } = getInitialMetadata(TilemapKey.Home);
    this.position = position;
    this.direction = direction;
  }
}

export const playerSchema = z.object({
  direction: directionSchema,
  inventory: inventorySchema,
  monsters: monsterSchema.array(),
  position: positionSchema,
  respawnLocation: respawnLocationSchema,
}) satisfies z.ZodType<Player>;
