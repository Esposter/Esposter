import { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import { MovementPattern } from "@/models/dungeons/npc/MovementPattern";
import type { Npc } from "@/models/dungeons/npc/Npc";
import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import type { Except } from "type-fest";
import type { PartialByKeys } from "unocss";

const NpcMap: Record<NpcId, PartialByKeys<Except<Npc, "id">, "frame" | "movementPattern">> = {
  [NpcId.John]: {
    frame: 20,
    movementPattern: MovementPattern.Clockwise,
    effects: [
      {
        type: EffectType.Message,
        messages: ["Make sure you read the signposts for helpful tips!"],
      },
    ],
  },
  [NpcId.Mum]: {
    frame: 30,
    effects: [
      {
        type: EffectType.Message,
        messages: ["You should take a quick rest."],
      },
      {
        type: EffectType.Heal,
      },
      {
        type: EffectType.SceneFade,
      },
      {
        type: EffectType.Message,
        messages: ["Oh good! You and your monsters are looking great!"],
      },
    ],
  },
  [NpcId.Smith]: {
    effects: [
      {
        type: EffectType.Message,
        messages: ["You can save your game from the menu.", "To open the menu, press the ENTER key."],
      },
    ],
  },
};

export const npcs: Npc[] = parseDictionaryToArray(NpcMap).map((npc) => ({
  ...npc,
  frame: npc.frame ?? 0,
  movementPattern: npc.movementPattern ?? MovementPattern.Idle,
}));
