import type { Npc } from "@/models/dungeons/npc/Npc";
import type { Except } from "type-fest";
import type { PartialByKeys } from "unocss";

import { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import { MovementPattern } from "@/models/dungeons/npc/MovementPattern";

const NpcMap: Record<NpcId, PartialByKeys<Except<Npc, "id">, "frame" | "movementPattern">> = {
  [NpcId.John]: {
    effects: [
      {
        messages: ["Make sure you read the signposts for helpful tips!"],
        type: EffectType.Message,
      },
    ],
    frame: 20,
    movementPattern: MovementPattern.Clockwise,
  },
  [NpcId.Mum]: {
    effects: [
      {
        messages: ["You should take a quick rest."],
        type: EffectType.Message,
      },
      {
        type: EffectType.Heal,
      },
      {
        type: EffectType.SceneFade,
      },
      {
        messages: ["Oh good! You and your monsters are looking great!"],
        type: EffectType.Message,
      },
    ],
    frame: 30,
  },
  [NpcId.Smith]: {
    effects: [
      {
        messages: ["You can save your game from the menu.", "To open the menu, press the ENTER key."],
        type: EffectType.Message,
      },
    ],
  },
};

export const npcs: Npc[] = parseDictionaryToArray(NpcMap).map((npc) => ({
  ...npc,
  frame: npc.frame ?? 0,
  movementPattern: npc.movementPattern ?? MovementPattern.Idle,
}));
