import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ROSARIA_CHARACTER_ID } from "#src/services/kit/characters/rosariaKit";
import { createRosariaKit } from "#src/services/kit/characters/rosariaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const ROSARIA_KIT = createRosariaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [ROSARIA_CHARACTER_ID]));

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
  ROSARIA_KIT.elementalBurst.onStart?.({
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: createRosariaCombatant(constellationCount),
    kitEffectState,
    party: createParty([ROSARIA_CHARACTER_ID]),
  });
  const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
  if (!field) throw new Error("Rites of Termination placed no field");
  return field.secondsRemaining;
};

describe(createRosariaKit, () => {
  test("the field Rites of Termination places lasts four seconds longer from Constellation 2", () => {
    expect.hasAssertions();
    expect(getFieldSeconds(2) - getFieldSeconds(0)).toBe(4);
  });
});
