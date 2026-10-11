import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ITTO_CHARACTER_ID } from "#src/services/kit/characters/ittoKit";
import { createIttoKit } from "#src/services/kit/characters/ittoKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";

const ITTO_KIT = createIttoKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [ITTO_CHARACTER_ID]));

const createIttoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ITTO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ITTO_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

describe(createIttoKit, () => {
  test("Royal Descent adds its ATK per DEF and a Geo conversion with the burst's Normal ATK SPD for its seconds", () => {
    expect.hasAssertions();
    const combatant = createIttoCombatant();
    const kitEffectState: KitEffectState = { effects: [] };

    ITTO_KIT.elementalBurst.onStart?.(createKitStepContext(combatant, { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.576 * combatant.attributes.defense,
        attribute: Attribute.Attack,
        characterId: ITTO_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 13.25,
      },
      {
        characterId: ITTO_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        normalAttackSpeedBonus: 0.1,
        secondsRemaining: 13.25,
      },
    ]);
  });

  test("the strikes, the Saichimonji Slash, the plunges and Masatsu Zetsugi read their table indexes at talent level 1", () => {
    expect.hasAssertions();
    const talentMultipliers = ITTO_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier);

    expect(talentMultipliers).toStrictEqual([0.792318, 0.76368, 0.916416, 1.172249]);
    expect(ITTO_KIT.chargedAttack.hits[0]?.talentMultiplier).toBe(0.90472);
    expect(ITTO_KIT.chargedAttackStamina).toBe(20);
    expect(ITTO_KIT.plungeCollision.talentMultiplier).toBe(0.818335);
    expect(ITTO_KIT.lowPlunge.hits[0]?.talentMultiplier).toBe(1.636323);
    expect(ITTO_KIT.highPlunge.hits[0]?.talentMultiplier).toBe(2.043855);
    expect(ITTO_KIT.elementalSkill.hits[0]?.talentMultiplier).toBe(3.072);
  });

  test("the skill and burst read their cooldowns and the burst its energy cost from the proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: ITTO_KIT.burstCooldownSeconds,
      burstEnergyCost: ITTO_KIT.burstEnergyCost,
      skillCooldownSeconds: ITTO_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 18, burstEnergyCost: 70, skillCooldownSeconds: 10 });
  });
});
