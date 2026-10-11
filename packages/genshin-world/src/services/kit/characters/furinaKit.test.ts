import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createFurinaKit, FURINA_CHARACTER_ID } from "#src/services/kit/characters/furinaKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const FURINA_KIT = createFurinaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [FURINA_CHARACTER_ID]));
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const MAX_HEALTH = 20_000;
const TEAMMATE_CHARACTER_ID = 1;
const LOW_TEAMMATE_CHARACTER_ID = 2;
const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };

const createFurinaCombatant = (combatant: Partial<Combatant> = {}): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: FURINA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: FURINA_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
  ...combatant,
});

const createEnemyAt = (x: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z: 0 },
});

// Runs the team's effects a frame at a time, Furina on the field and every combatant given in the deployed team
const stepFrames = (
  frames: number,
  kitEffectState: KitEffectState,
  party: Party,
  combatants: Combatant[],
  enemies: Enemy[] = [],
): void => {
  const [activeCombatant] = combatants;
  if (!activeCombatant) return;
  for (let frame = 0; frame < frames; frame++)
    stepKitEffects(kitEffectState, 1 / 60, {
      activeCombatant,
      body: body.position,
      characterIdCombatantMap: new Map(combatants.map((combatant) => [combatant.characterId, combatant])),
      enemyMap: new Map(enemies.map((enemy, index) => [`${index}`, enemy])),
      party,
    });
};

const getFieldIds = ({ effects }: KitEffectState): (string | undefined)[] =>
  effects.flatMap((effect) => (effect.kind === "field" ? [effect.id] : []));

describe(createFurinaKit, () => {
  test("the charged attack turns her to Pneuma a frame after its hit, handing Salon Solitaire's members to the Singer", () => {
    expect.hasAssertions();
    const combatant = createFurinaCombatant();
    const party = createParty([FURINA_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    FURINA_KIT.elementalSkill.onStart?.({ body, combatant, kitEffectState, party });
    stepFrames(60, kitEffectState, party, [combatant]);
    FURINA_KIT.chargedAttack.onStart?.({ body, combatant, kitEffectState, party });
    stepFrames(30, kitEffectState, party, [combatant]);
    const beforeSwitch = getFieldIds(kitEffectState).filter(Boolean);
    stepFrames(10, kitEffectState, party, [combatant]);

    expect(beforeSwitch).toStrictEqual(["furina-salon-member", "furina-salon-member", "furina-salon-member"]);
    expect(getFieldIds(kitEffectState).filter(Boolean)).toStrictEqual(["furina-singer"]);
  });

  test("a Salon member's attack drains each member above half HP and strikes a tenth harder for each one drained", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant();
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const lowTeammate = createFurinaCombatant({ characterId: LOW_TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID, LOW_TEAMMATE_CHARACTER_ID]);
    getPartyMember(party, LOW_TEAMMATE_CHARACTER_ID).healthShare = 0.4;
    const kitEffectState: KitEffectState = { effects: [] };
    FURINA_KIT.elementalSkill.onStart?.({ body, combatant: furina, kitEffectState, party });
    // Mademoiselle Crabaletta attacks first, 18 frames for the bubble and 71.6 for its first tick
    stepFrames(90, kitEffectState, party, [furina, teammate, lowTeammate], [createEnemyAt(3)]);
    const attack = kitEffectState.effects.find(
      (effect) => effect.kind === "summon" && effect.id === "furina-salon-attack",
    );

    expect(party.healthChanges.map(({ characterId }) => characterId)).toStrictEqual([
      FURINA_CHARACTER_ID,
      TEAMMATE_CHARACTER_ID,
    ]);
    expect(party.healthChanges.every(({ healthShare }) => Math.abs(healthShare + 0.036) < 1e-9)).toBe(true);
    expect(attack?.kind === "summon" ? attack.hits[0]?.additiveBaseDamageBonus?.(furina) : undefined).toBeCloseTo(
      0.08288 * 1.2 * MAX_HEALTH,
    );
  });

  test("the Salon drains no one and strikes nothing with no enemy in reach", () => {
    expect.hasAssertions();
    const combatant = createFurinaCombatant();
    const party = createParty([FURINA_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    FURINA_KIT.elementalSkill.onStart?.({ body, combatant, kitEffectState, party });
    stepFrames(300, kitEffectState, party, [combatant], [createEnemyAt(100)]);

    expect(party.healthChanges).toStrictEqual([]);
  });

  test("the burst's Fanfare gains a point for each 1% of HP changed and gives every member its DMG Bonus, a change within the debounce landing as it closes", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant();
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitEventContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      kitEffectState,
      party,
    });
    const drain: KitHealthChangedEvent = {
      characterId: TEAMMATE_CHARACTER_ID,
      healthShare: -0.1,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
    };
    const readFanfare = (): number | undefined =>
      findKitStatus(kitEffectState.effects, FURINA_CHARACTER_ID, "furina-fanfare")?.stacks;
    FURINA_KIT.elementalBurst.onStart?.({ body, combatant: furina, kitEffectState, party });
    stepFrames(100, kitEffectState, party, [furina, teammate]);
    FURINA_KIT.onKitEvent?.(drain, context);
    stepFrames(10, kitEffectState, party, [furina, teammate]);
    const afterFirst = readFanfare();
    FURINA_KIT.onKitEvent?.(drain, context);
    stepFrames(20, kitEffectState, party, [furina, teammate]);
    const withinDebounce = readFanfare();
    stepFrames(10, kitEffectState, party, [furina, teammate]);
    const teammateHydroBonus = kitEffectState.effects.find(
      (effect) =>
        effect.kind === "buff" &&
        effect.characterId === TEAMMATE_CHARACTER_ID &&
        effect.attribute === Attribute.HydroDamageBonus,
    );

    expect([afterFirst, withinDebounce, readFanfare()]).toStrictEqual([10, 10, 20]);
    expect(teammateHydroBonus?.kind === "buff" ? teammateHydroBonus.amount : undefined).toBeCloseTo(20 * 0.0007);
  });

  test("endless waltz heals every member 2% of Max HP every two seconds while another's heal past full HP on the character on the field is under four seconds old", () => {
    expect.hasAssertions();
    const furina = createFurinaCombatant({ ascension: 1 });
    const teammate = createFurinaCombatant({ characterId: TEAMMATE_CHARACTER_ID });
    const party = createParty([FURINA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]);
    getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare = 0.5;
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitEventContext(furina, {
      characterIdCombatantMap: new Map([
        [FURINA_CHARACTER_ID, furina],
        [TEAMMATE_CHARACTER_ID, teammate],
      ]),
      kitEffectState,
      party,
    });
    const overheal: KitHealthChangedEvent = {
      characterId: FURINA_CHARACTER_ID,
      healthShare: 0,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0.1,
      sourceCharacterId: TEAMMATE_CHARACTER_ID,
    };
    FURINA_KIT.onKitEvent?.(overheal, context);
    stepFrames(60, kitEffectState, party, [furina, teammate]);
    // A second overheal a second in keeps the regeneration's ticks at two and four seconds, and none at six
    FURINA_KIT.onKitEvent?.(overheal, context);
    stepFrames(360, kitEffectState, party, [furina, teammate]);

    expect(getPartyMember(party, TEAMMATE_CHARACTER_ID).healthShare).toBeCloseTo(0.54);
  });

  test("a strike that lands opens the Arkhe's hit as a normal attack, once within each Arkhe's cooldown", () => {
    expect.hasAssertions();
    const combatant = createFurinaCombatant();
    const party = createParty([FURINA_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const strike = (): void =>
      FURINA_KIT.normalAttacks[0]?.hits[0]?.onStrike?.({ body, combatant, kitEffectState, party });
    const countArkheHits = (): number =>
      kitEffectState.effects.filter((effect) => effect.kind === "summon" && effect.attackTag === AttackTag.NormalAttack)
        .length;
    strike();
    strike();
    const inOusia = countArkheHits();
    FURINA_KIT.chargedAttack.onStart?.({ body, combatant, kitEffectState, party });
    stepFrames(40, kitEffectState, party, [combatant]);
    strike();

    expect([inOusia, countArkheHits()]).toStrictEqual([1, 1]);
    expect(findKitStatus(kitEffectState.effects, FURINA_CHARACTER_ID, "furina-surging-blade-cooldown")).toBeDefined();
  });
});
