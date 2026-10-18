import type { Attribute } from "#src/models/character/Attribute";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// The Traveler a weapon passive's suite wields at level one with her kit, the attribute lines given and no resonances
export const createWielderCombatant = (attributeLines: readonly AttributeLine[] = []): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes(attributeLines),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

// The reaction a striker triggers on an enemy, one reaction of the given type and element, as the kit's event carries it
export const createReaction = (striker: Combatant, enemy: Enemy, reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element, reactionType }],
  striker,
});

// The buff an attribute has among a kit's effects, if it has one
export const getBuff = (kitEffectState: KitEffectState, attribute: Attribute): KitBuff | undefined =>
  kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute);

describe.todo("createPassiveTestHelpers");
