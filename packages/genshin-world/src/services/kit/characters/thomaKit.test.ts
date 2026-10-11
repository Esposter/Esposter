import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createThomaKit, THOMA_CHARACTER_ID } from "#src/services/kit/characters/thomaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const THOMA_KIT = createThomaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [THOMA_CHARACTER_ID]));

const createThomaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: THOMA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: THOMA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// Starts a normal attack on the field: each summon that answers one is set off
const startNormalAttack = (context: KitContext): void => {
  for (const effect of context.kitEffectState.effects)
    if (effect.kind === "summon") effect.onNormalAttackStart?.(context);
};

// Sets off a Fiery Collapse over the shield standing, if any, strikes with it the given times, and reads the shield
const readShieldHealth = (standingShieldHealth: number | undefined, strikeCount: number): number[] => {
  const context = createKitTestContext(createThomaCombatant());
  if (standingShieldHealth !== undefined)
    context.kitEffectState.effects.push({
      characterId: THOMA_CHARACTER_ID,
      element: Element.Pyro,
      health: standingShieldHealth,
      kind: "shield",
      secondsRemaining: 8,
    });
  THOMA_KIT.elementalBurst.onStart?.(context);
  startNormalAttack(context);
  const fieryCollapse = context.kitEffectState.effects.find(
    (effect) => effect.kind === "summon" && effect.hits.length > 0,
  );
  const hit = fieryCollapse?.kind === "summon" ? fieryCollapse.hits[0] : undefined;
  if (hit)
    for (let index = 0; index < strikeCount; index++)
      hit.onStrike?.(context, { body: context.body, combatant: context.activeCombatant, hit });
  return context.kitEffectState.effects.flatMap((effect) =>
    effect.kind === "shield" && effect.secondsRemaining > 0 ? [effect.health] : [],
  );
};

describe(createThomaKit, () => {
  test("blazing Blessing sets a shield of the table's share of Max HP and flat HP, and infuses Thoma with Pyro", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    THOMA_KIT.elementalSkill.onStart?.(createKitTestContext(createThomaCombatant(), { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: THOMA_CHARACTER_ID,
        element: Element.Pyro,
        health: 0.072 * 10_000 + 693.33484,
        kind: "shield",
        secondsRemaining: 8,
      },
      { characterId: THOMA_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 0.5 },
    ]);
  });

  test("the burst sets off a Fiery Collapse from a normal attack started on the field, once a second, for its seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createThomaCombatant());
    THOMA_KIT.elementalBurst.onStart?.(context);
    startNormalAttack(context);
    startNormalAttack(context);

    expect(
      context.kitEffectState.effects.map((effect) =>
        effect.kind === "summon"
          ? [
              effect.secondsRemaining,
              effect.hits.map(({ element, gauge, hitmarkSeconds, talentMultiplier }) => [
                element,
                gauge,
                hitmarkSeconds,
                talentMultiplier,
              ]),
            ]
          : [effect.kind, effect.secondsRemaining],
      ),
    ).toStrictEqual([
      [15, []],
      ["status", 1],
      [11 / 60 + 0.1, [[Element.Pyro, 1, 11 / 60, 0.58]]],
    ]);
  });

  test("a Fiery Collapse's first strike adds its shield to Thoma's standing one, up to the most his shield may hold", () => {
    expect.hasAssertions();
    const fieryCollapseShieldHealth = 0.01144 * 10_000 + 110.03398;
    const maxShieldHealth = 0.196 * 10_000 + 1887.4199;
    expect(readShieldHealth(undefined, 2)).toStrictEqual([fieryCollapseShieldHealth]);
    expect(readShieldHealth(1000, 1)).toStrictEqual([1000 + fieryCollapseShieldHealth]);
    expect(readShieldHealth(maxShieldHealth - 1, 1)).toStrictEqual([maxShieldHealth]);
  });
});
