import type { Artifact } from "#src/models/artifact/Artifact";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import {
  ADVENTURER_ARTIFACT_SET_ID,
  BERSERKER_ARTIFACT_SET_ID,
  INSTRUCTOR_ARTIFACT_SET_ID,
} from "#src/services/artifact/constants";
import { getArtifactSetKit } from "#src/services/artifact/getArtifactSetKit";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createSetArtifacts = (setId: number, count: number): Artifact[] =>
  Array.from({ length: count }, () => ({
    experience: 0,
    isLocked: false,
    level: 0,
    mainAffix: Attribute.Health,
    minorAffixes: [],
    rarity: 4,
    setId,
    slot: ArtifactSlot.FlowerOfLife,
  }));

const createSetCombatant = (characterId: number, kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 3000 }]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

describe(getArtifactSetKit, () => {
  test("keeps the kit as it is for a set worn short of its bonus that waits on combat", () => {
    expect.hasAssertions();

    expect(
      getArtifactSetKit(TRAVELER_KIT, createSetArtifacts(INSTRUCTOR_ARTIFACT_SET_ID, 2), statTables.artifactSetDataMap),
    ).toBe(TRAVELER_KIT);
  });

  test("answers a reaction with the set's module once the pieces worn reach its bonus", () => {
    expect.hasAssertions();

    const kit = getArtifactSetKit(
      TRAVELER_KIT,
      createSetArtifacts(INSTRUCTOR_ARTIFACT_SET_ID, 4),
      statTables.artifactSetDataMap,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit,
      level: 1,
    };
    const kitEffectState: KitEffectState = { effects: [] };
    kit.onKitEvent?.(
      {
        enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: ReactionType.Melt }],
        striker: combatant,
      },
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 120,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "Instructor",
      },
    ]);
  });

  test("prices its wearer with its sets' modules' bonuses after the kit's own, at the HP it stands at", () => {
    expect.hasAssertions();

    const kit = getArtifactSetKit(
      { ...TRAVELER_KIT, getPassiveBonuses: () => [{ amount: 1, attribute: Attribute.Attack }] },
      createSetArtifacts(BERSERKER_ARTIFACT_SET_ID, 4),
      statTables.artifactSetDataMap,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit,
      level: 1,
    };

    expect(kit.getPassiveBonuses?.(combatant, 0.5)).toStrictEqual([
      { amount: 1, attribute: Attribute.Attack },
      { amount: 0.24, attribute: Attribute.CriticalRate },
    ]);
  });

  test("a wearer of fewer than four pieces is not restored", () => {
    expect.hasAssertions();

    const kit = getArtifactSetKit(
      TRAVELER_KIT,
      createSetArtifacts(ADVENTURER_ARTIFACT_SET_ID, 2),
      statTables.artifactSetDataMap,
    );
    const combatant = createSetCombatant(TRAVELER_CHARACTER_ID, kit);
    const kitEffectState: KitEffectState = { effects: [] };
    kit.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.ChestOpened },
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("another party member without the set is not restored", () => {
    expect.hasAssertions();

    const wearer = createSetCombatant(
      TRAVELER_CHARACTER_ID,
      getArtifactSetKit(TRAVELER_KIT, createSetArtifacts(ADVENTURER_ARTIFACT_SET_ID, 4), statTables.artifactSetDataMap),
    );
    const ally = createSetCombatant(TRAVELER_CHARACTER_ID + 1, TRAVELER_KIT);
    const party = createParty([wearer.characterId, ally.characterId]);
    getPartyMember(party, wearer.characterId).healthShare = 0.5;
    getPartyMember(party, ally.characterId).healthShare = 0.5;
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [ally.characterId, ally],
        [wearer.characterId, wearer],
      ]),
      party,
    });
    emitKitEvent({ characterId: ally.characterId, kind: KitEventKind.ChestOpened }, context);
    for (let stepIndex = 0; stepIndex < Math.round(5 / FIXED_STEP_SECONDS); stepIndex++)
      stepKitEffects(FIXED_STEP_SECONDS, context);

    expect(getPartyMember(party, wearer.characterId).healthShare).toBeCloseTo(0.8);
    expect(getPartyMember(party, ally.characterId).healthShare).toBe(0.5);
  });
});
