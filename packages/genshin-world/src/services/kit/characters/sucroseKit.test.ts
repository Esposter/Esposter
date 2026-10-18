import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { GANYU_CHARACTER_ID } from "#src/services/kit/characters/ganyuKit";
import { MONA_CHARACTER_ID } from "#src/services/kit/characters/monaKit";
import { createSucroseKitBehaviour, SUCROSE_CHARACTER_ID } from "#src/services/kit/characters/sucroseKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SUCROSE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SUCROSE_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createSucroseCombatant = (ascension = 0, constellationCount = 0, elementalMastery = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
  characterId: SUCROSE_CHARACTER_ID,
  constellationCount,
  element: Element.Anemo,
  elementalResonances: [],
  kit: SUCROSE_KIT,
  level: 90,
});

const findTickField = (effects: KitEffect[]): KitField => {
  const field = effects.find((effect): effect is KitField => effect.kind === "field");
  if (!field) throw new Error("The burst casts no field");
  return field;
};

const castEffects = (combatant: Combatant): KitEffect[] => {
  const context = createKitTestContext(combatant);
  SUCROSE_KIT.elementalBurst.onStart?.(context);
  return context.kitEffectState.effects;
};

// Sucrose's normal and charged attacks landing, as the step sends them for the character on the field
const createNormalAttackLandedEvent = (): KitEvent => ({
  action: takeOne(SUCROSE_KIT.normalAttacks),
  kind: KitEventKind.NormalAttackLanded,
});
const createChargedAttackLandedEvent = (): KitEvent => ({
  action: SUCROSE_KIT.chargedAttack,
  kind: KitEventKind.ChargedAttackLanded,
});

describe(createSucroseKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...SUCROSE_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(SUCROSE_KIT.chargedAttack.hits).talentMultiplier,
      SUCROSE_KIT.plungeCollision.talentMultiplier,
      takeOne(SUCROSE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SUCROSE_KIT.highPlunge.hits).talentMultiplier,
      takeOne(SUCROSE_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.33464, 0.30616, 0.38448, 0.479176, 1.2016, 0.568288, 1.136335, 1.419344, 2.112];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("constellation 2 lengthens the burst's field by 2 seconds, and its Anemo tick lands from the first", () => {
    expect.hasAssertions();
    const baseField = findTickField(castEffects(createSucroseCombatant(0, 0)));
    const constellationField = findTickField(castEffects(createSucroseCombatant(0, 2)));

    expect(constellationField.secondsRemaining - baseField.secondsRemaining).toBeCloseTo(2);
    expect(baseField.nextTickSeconds).toBeCloseTo(137 / 60);
  });

  test("a Swirl Sucrose triggers gives the members of the swirled element 50 Elemental Mastery for 8 seconds, and no other", () => {
    expect.hasAssertions();
    const sucrose = createSucroseCombatant(1);
    const ganyu = { ...createSucroseCombatant(), characterId: GANYU_CHARACTER_ID, element: Element.Cryo };
    const mona = { ...createSucroseCombatant(), characterId: MONA_CHARACTER_ID, element: Element.Hydro };
    const party = createParty([SUCROSE_CHARACTER_ID, GANYU_CHARACTER_ID, MONA_CHARACTER_ID]);
    const context = createKitTestContext(sucrose, {
      characterIdCombatantMap: new Map([
        [GANYU_CHARACTER_ID, ganyu],
        [MONA_CHARACTER_ID, mona],
        [SUCROSE_CHARACTER_ID, sucrose],
      ]),
      party,
    });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    SUCROSE_KIT.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ element: Element.Cryo, reactionType: ReactionType.Swirl }],
        striker: sucrose,
      },
      context,
      sucrose,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 50,
        attribute: Attribute.ElementalMastery,
        characterId: GANYU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "sucrose-swirl",
      },
    ]);
  });

  test("ascension 4 gives the rest of the team a fifth of her Elemental Mastery on each skill hit", () => {
    expect.hasAssertions();
    const sucrose = createSucroseCombatant(4, 0, 400);
    const ganyu = { ...createSucroseCombatant(), characterId: GANYU_CHARACTER_ID, element: Element.Cryo };
    const party = createParty([SUCROSE_CHARACTER_ID, GANYU_CHARACTER_ID]);
    const context = createKitTestContext(sucrose, {
      characterIdCombatantMap: new Map([
        [GANYU_CHARACTER_ID, ganyu],
        [SUCROSE_CHARACTER_ID, sucrose],
      ]),
      party,
    });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const skillHit: KitHit = takeOne(SUCROSE_KIT.elementalSkill.hits);
    SUCROSE_KIT.onKitEvent?.(
      { enemy, hit: skillHit, isCritical: false, isDefeated: false, kind: KitEventKind.DamageTaken, striker: sucrose },
      context,
      sucrose,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 80,
        attribute: Attribute.ElementalMastery,
        characterId: GANYU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "sucrose-skill-burst",
      },
    ]);
  });

  test("a Constellation 1 switch adds one Astable Anemohypostasis Creation charge", () => {
    expect.hasAssertions();

    expect(SUCROSE_KIT.getSkillChargeBonus?.(createSucroseCombatant(0, 1))).toBe(1);
  });

  test("a Constellation 0 switch adds no Astable Anemohypostasis Creation charge", () => {
    expect.hasAssertions();

    expect(SUCROSE_KIT.getSkillChargeBonus?.(createSucroseCombatant(0, 0))).toBe(0);
  });

  test("constellation 4 cuts the skill's cooldown by a random 1 to 7 seconds on each seventh attack", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    for (let attack = 0; attack < 7; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(6);
  });

  test("constellation 4 cuts nothing before the seventh attack", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    for (let attack = 0; attack < 6; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBe(10);
  });

  test("constellation 4 counts its next seven attacks again after each cut", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    for (let attack = 0; attack < 14; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(8);
  });

  test("constellation 4 counts charged attacks along with normal attacks", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    for (let attack = 0; attack < 3; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);
    for (let attack = 0; attack < 4; attack++)
      SUCROSE_KIT.onKitEvent?.(createChargedAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(6);
  });

  test("constellation 4 counts no attack while another character is on the field", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    const offFieldContext = { ...context, activeCombatant: { ...combatant, characterId: MONA_CHARACTER_ID } };
    for (let attack = 0; attack < 7; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), offFieldContext, combatant);

    expect(partyMember.skillCooldownSeconds).toBe(10);
  });

  test("constellation 4 counts no attack below its constellation", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 3);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 10;
    for (let attack = 0; attack < 7; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBe(10);
  });

  test("constellation 4's cut leaves a skill that is already ready at zero", () => {
    expect.hasAssertions();
    const combatant = createSucroseCombatant(0, 4);
    const { kitEffectState } = createKitTestContext(combatant);
    const context = createKitTestContext(combatant, { kitEffectState, random: () => 0.5 });
    const partyMember = getPartyMember(context.party, SUCROSE_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 0;
    for (let attack = 0; attack < 7; attack++)
      SUCROSE_KIT.onKitEvent?.(createNormalAttackLandedEvent(), context, combatant);

    expect(partyMember.skillCooldownSeconds).toBe(0);
  });
});
