import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { EULA_CHARACTER_ID } from "#src/services/character/constants";
import { createEulaKit } from "#src/services/kit/characters/eulaKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const EULA_KIT = createEulaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [EULA_CHARACTER_ID]));

const createEulaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: EULA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: EULA_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };

describe(createEulaKit, () => {
  test("a press's strike gains a Grimheart stack, and the hold spends the stacks into one Icewhirl each", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const press = EULA_KIT.elementalSkill.hits[0];
    if (!press?.onStrike) throw new Error("Icetide Vortex's press has no Grimheart stack on hit");

    press.onStrike({ body, combatant: createEulaCombatant(), kitEffectState });
    press.onStrike({ body, combatant: createEulaCombatant(), kitEffectState });
    // The second strike falls inside the press's 0.3 seconds of ICD, so only the one stack is gained
    expect(
      kitEffectState.effects.filter(
        (effect) => effect.kind === "status" && effect.id.startsWith("eula-grimheart-stack"),
      ),
    ).toHaveLength(1);

    const hold = EULA_KIT.elementalSkillHolds?.[0];
    if (!hold?.action.onStart) throw new Error("Icetide Vortex's hold has no start");
    hold.action.onStart({ body, combatant: createEulaCombatant(), kitEffectState });

    const icewhirls = kitEffectState.effects.find((effect) => effect.kind === "summon");
    if (icewhirls?.kind !== "summon") throw new Error("the hold casts no Icewhirl summon");
    expect(icewhirls.hits).toHaveLength(1);
    expect(
      kitEffectState.effects.some((effect) => effect.kind === "status" && effect.id.startsWith("eula-grimheart-stack")),
    ).toBe(false);
  });

  test("a swap of characters ends the Lightfall Sword early, its explosion landing 35 frames on", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    EULA_KIT.elementalBurst.onStart?.({ body, combatant: createEulaCombatant(), kitEffectState });

    EULA_KIT.onKitEvent?.(
      { characterId: EULA_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: EULA_CHARACTER_ID },
      createKitEventContext(createEulaCombatant(), { kitEffectState }),
    );

    const [explosion] = kitEffectState.effects;
    if (explosion?.kind !== "summon") throw new Error("the swap casts no explosion");
    expect(explosion.hits[0]?.hitmarkSeconds).toBeCloseTo(35 / 60);
  });
});
