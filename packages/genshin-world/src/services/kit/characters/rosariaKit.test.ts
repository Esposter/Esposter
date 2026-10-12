import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createRosariaKitBehaviour, ROSARIA_CHARACTER_ID } from "#src/services/kit/characters/rosariaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const ROSARIA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ROSARIA_CHARACTER_ID);
const createRosariaCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ROSARIA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: ROSARIA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

const getFieldSeconds = (constellationCount: number): number => {
  const kitEffectState: KitEffectState = { effects: [] };
  ROSARIA_KIT.elementalBurst.onStart?.(
    createKitTestContext(createRosariaCombatant(constellationCount), { kitEffectState }),
  );
  const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
  if (!field) throw new Error("Rites of Termination placed no field");
  return field.secondsRemaining;
};

describe(createRosariaKitBehaviour, () => {
  test("the field Rites of Termination places lasts four seconds longer from Constellation 2", () => {
    expect.hasAssertions();
    expect(getFieldSeconds(2) - getFieldSeconds(0)).toBe(4);
  });

  test("each tick of Rites of Termination lands from where the lance was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createRosariaCombatant(0));
    ROSARIA_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });
});
