import { AttackId } from "@/models/dungeons/attack/AttackId";
import { directionSchema } from "@/models/dungeons/data/Direction";
import { positionSchema } from "@/models/dungeons/data/Position";
import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { monsterSchema } from "@/models/dungeons/monster/Monster";
import { MonsterId } from "@/models/dungeons/monster/MonsterId";
import type { Position } from "grid-engine";
import { z } from "zod";

export class Player {
  position: Position = { x: 6, y: 21 };
  direction: InteractableDirection = InteractableDirection.DOWN;
  monsters: Monster[] = [
    {
      id: MonsterId.Iguanignite,
      name: MonsterId.Iguanignite,
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
}

export const playerSchema = z.object({
  position: positionSchema,
  direction: directionSchema,
  monsters: z.array(monsterSchema),
}) satisfies z.ZodType<Player>;
