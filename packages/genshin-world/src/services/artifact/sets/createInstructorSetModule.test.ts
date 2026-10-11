import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitReactionTriggeredEvent } from "#src/models/kit/KitReactionTriggeredEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { INSTRUCTOR_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createInstructorSetModule } from "#src/services/artifact/sets/createInstructorSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createPartyCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createInstructorSetModule, () => {
  const instructorSetData = statTables.artifactSetDataMap.get(INSTRUCTOR_ARTIFACT_SET_ID);
  assert.exists(instructorSetData);
  const instructorSetModule = createInstructorSetModule(takeOne(instructorSetData.bonuses, 1));
  const PARTY_CHARACTER_IDS = [1, 2];
  const party = createParty(PARTY_CHARACTER_IDS);
  const wearer = createPartyCombatant(takeOne(PARTY_CHARACTER_IDS, 0));
  const ally = createPartyCombatant(takeOne(PARTY_CHARACTER_IDS, 1));
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const createReactionEvent = (striker: Combatant): KitReactionTriggeredEvent => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType: ReactionType.Melt }],
    striker,
  });

  test("gives every deployed member 120 Elemental Mastery for 8 seconds on a reaction its wearer triggers on the field, restarted rather than stacked", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitEventContext(wearer, { kitEffectState, party });
    instructorSetModule.onKitEvent(createReactionEvent(wearer), context);
    for (const effect of kitEffectState.effects) effect.secondsRemaining = 1;
    instructorSetModule.onKitEvent(createReactionEvent(wearer), context);

    expect(kitEffectState.effects).toStrictEqual(
      PARTY_CHARACTER_IDS.map((characterId) => ({
        amount: 120,
        attribute: Attribute.ElementalMastery,
        characterId,
        kind: "buff",
        secondsRemaining: 8,
        source: "Instructor",
      })),
    );
  });

  test.each([
    ["another member triggers", ally, wearer],
    ["its wearer triggers off the field", wearer, ally],
  ])("gives nothing on a reaction %s", (_, striker, activeCombatant) => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    instructorSetModule.onKitEvent(
      createReactionEvent(striker),
      createKitEventContext(wearer, { activeCombatant, kitEffectState, party }),
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
