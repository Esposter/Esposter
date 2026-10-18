import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createEulaKitBehaviour, EULA_CHARACTER_ID } from "#src/services/kit/characters/eulaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const EULA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, EULA_CHARACTER_ID);
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

// A kit effect state holding the given number of Grimheart stacks
const createGrimheartState = (stacks: number): KitEffectState => {
  const kitEffectState: KitEffectState = { effects: [] };
  for (const id of ["eula-grimheart-stack-0", "eula-grimheart-stack-1"].slice(0, stacks))
    addKitStatus(kitEffectState, EULA_CHARACTER_ID, { id, secondsRemaining: 18 });
  return kitEffectState;
};

const countGrimheartStacks = (kitEffectState: KitEffectState): number =>
  kitEffectState.effects.filter((effect) => effect.kind === "status" && effect.id.startsWith("eula-grimheart-stack"))
    .length;

// Icetide Vortex's hold, with the stacks it finds, as Eula at the ascension stood
const castHold = (ascension: number, stacks: number): KitEffectState => {
  const kitEffectState = createGrimheartState(stacks);
  const hold = EULA_KIT.elementalSkillHolds?.[0];
  if (!hold?.action.onStart) throw new Error("Icetide Vortex's hold has no start");
  hold.action.onStart(createKitTestContext({ ...createEulaCombatant(), ascension }, { kitEffectState }));
  return kitEffectState;
};

// Glacial Illumination cast with the stacks found, as Eula at the ascension stood, and the stacks it leaves her
const castBurstStacks = (ascension: number, stacks: number): number => {
  const kitEffectState = createGrimheartState(stacks);
  EULA_KIT.elementalBurst.onStart?.(createKitTestContext({ ...createEulaCombatant(), ascension }, { kitEffectState }));
  return countGrimheartStacks(kitEffectState);
};

// The seconds left on Icetide Vortex's cooldown once Glacial Illumination is cast, as Eula at the ascension stood with a
// Second of it left
const castBurstSkillCooldown = (ascension: number): number => {
  const party = createParty([EULA_CHARACTER_ID]);
  getPartyMember(party, EULA_CHARACTER_ID).skillCooldownSeconds = 1;
  EULA_KIT.elementalBurst.onStart?.(
    createKitTestContext({ ...createEulaCombatant(), ascension }, { kitEffectState: { effects: [] }, party }),
  );
  return getPartyMember(party, EULA_CHARACTER_ID).skillCooldownSeconds;
};

describe(createEulaKitBehaviour, () => {
  test("a press's strike gains a Grimheart stack, and the hold spends the stacks into one Icewhirl each", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const press = EULA_KIT.elementalSkill.hits[0];
    if (!press?.onStrike) throw new Error("Icetide Vortex's press has no Grimheart stack on hit");
    const combatant = createEulaCombatant();
    const context = createKitTestContext(combatant, { kitEffectState });

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    press.onStrike(context, { body: context.body, combatant, hit: press }, enemy);
    press.onStrike(context, { body: context.body, combatant, hit: press }, enemy);
    // The second strike falls inside the press's 0.3 seconds of ICD, so only the one stack is gained
    expect(
      kitEffectState.effects.filter(
        (effect) => effect.kind === "status" && effect.id.startsWith("eula-grimheart-stack"),
      ),
    ).toHaveLength(1);

    const hold = EULA_KIT.elementalSkillHolds?.[0];
    if (!hold?.action.onStart) throw new Error("Icetide Vortex's hold has no start");
    hold.action.onStart(context);

    const icewhirls = kitEffectState.effects.find((effect) => effect.kind === "summon");
    if (icewhirls?.kind !== "summon") throw new Error("the hold casts no Icewhirl summon");
    expect(icewhirls.hits).toHaveLength(1);
    expect(
      kitEffectState.effects.some((effect) => effect.kind === "status" && effect.id.startsWith("eula-grimheart-stack")),
    ).toBe(false);
  });

  test("a swap of characters ends the Lightfall Sword early, its explosion landing 35 frames on", () => {
    expect.hasAssertions();
    const combatant = createEulaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    EULA_KIT.elementalBurst.onStart?.(context);

    EULA_KIT.onKitEvent?.(
      { characterId: EULA_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: EULA_CHARACTER_ID },
      context,
      combatant,
    );

    const [explosion] = kitEffectState.effects;
    if (explosion?.kind !== "summon") throw new Error("the swap casts no explosion");
    expect(explosion.hits[0]?.hitmarkSeconds).toBeCloseTo(35 / 60);
  });

  test("the Ascension 1 passive, Roiling Rime, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castHold(1, 2).effects.filter((effect) => effect.kind === "summon")).toHaveLength(2);
  });

  test("the Ascension 1 passive, Roiling Rime, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castHold(0, 2).effects.filter((effect) => effect.kind === "summon")).toHaveLength(1);
  });

  test("the Ascension 4 passive, Wellspring of War-Lust, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstStacks(4, 1)).toBe(2);
  });

  test("the Ascension 4 passive, Wellspring of War-Lust, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstStacks(3, 1)).toBe(1);
  });
});

describe("wellspring of War-Lust's cooldown reset", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstSkillCooldown(4)).toBe(0);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstSkillCooldown(3)).toBe(1);
  });
});
