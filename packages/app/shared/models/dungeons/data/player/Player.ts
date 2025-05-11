import type { Item } from "@/models/dungeons/item/Item";
import type { Direction, Position } from "grid-engine";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { directionSchema } from "#shared/models/dungeons/data/player/Direction";
import { inventorySchema } from "#shared/models/dungeons/data/player/Inventory";
import { positionSchema } from "#shared/models/dungeons/data/player/Position";
import { RespawnLocation, respawnLocationSchema } from "#shared/models/dungeons/data/player/RespawnLocation";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { Monster, monsterSchema } from "@/models/dungeons/monster/Monster";
import { getItem } from "@/services/dungeons/item/getItem";
import { getInitialMetadata } from "@/services/dungeons/scene/world/TilemapInitialPositionMap";
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
        new Monster(FileKey.UIMonstersIguanignite),
        new Monster(FileKey.UIMonstersCarnodusk),
        new Monster(FileKey.UIMonstersIgnivolt),
      ];
      for (const monster of monsters) {
        monster.stats.attack = 100;
        monster.status.hp = 5;
      }
      return monsters;
    }
    return [new Monster(FileKey.UIMonstersIguanignite)];
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
