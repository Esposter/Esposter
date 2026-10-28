import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { GILDED_DREAMS_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createGildedDreamsSetModule } from "#src/services/artifact/sets/createGildedDreamsSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (characterId: number, element: Element): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit: KIT,
  level: 1,
});
// The buffs the wearer carries from the set, as the attribute and amount it has
const getGildedBuffs = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.flatMap((effect) =>
    effect.kind === "buff" && effect.source === "Gilded Dreams"
      ? [{ amount: effect.amount, attribute: effect.attribute }]
      : [],
  );

describe(createGildedDreamsSetModule, () => {
  const SAME_ELEMENT_CHARACTER_ID = 2;
  const PYRO_CHARACTER_ID = 3;
  const CRYO_CHARACTER_ID = 4;
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wearer: Combatant = {
    ...createCombatant(TRAVELER_CHARACTER_ID, Element.Hydro),
    kit: getPassiveKit(KIT, [
      createGildedDreamsSetModule(getArtifactSetBonus(statTables, GILDED_DREAMS_ARTIFACT_SET_ID, 4)),
    ]),
  };
  const members = [
    wearer,
    createCombatant(SAME_ELEMENT_CHARACTER_ID, Element.Hydro),
    createCombatant(PYRO_CHARACTER_ID, Element.Pyro),
    createCombatant(CRYO_CHARACTER_ID, Element.Cryo),
  ];
  const characterIdCombatantMap = new Map(members.map((member) => [member.characterId, member]));
  // A reaction a member's strike set off on the enemy, as the team's kits hear it
  const triggerReaction = (striker: Combatant, context: ReturnType<typeof createKitTestContext>) => {
    emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions: [], striker }, context);
  };

  test("a reaction gives the wearer ATK +14% for each other member of its element and Elemental Mastery +50 for each member of another element, for eight seconds, from off the field too", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([SAME_ELEMENT_CHARACTER_ID, TRAVELER_CHARACTER_ID, PYRO_CHARACTER_ID, CRYO_CHARACTER_ID]),
    });

    triggerReaction(wearer, context);
    expect(getGildedBuffs(kitEffectState)).toStrictEqual([
      { amount: expect.closeTo(0.14), attribute: Attribute.AttackPercent },
      { amount: 100, attribute: Attribute.ElementalMastery },
    ]);

    stepKitSeconds(context, 8.1);
    expect(getGildedBuffs(kitEffectState)).toStrictEqual([]);
  });

  test("a reaction a member other than the wearer strikes gives the wearer nothing, and leaves its cooldown unstarted", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, SAME_ELEMENT_CHARACTER_ID, PYRO_CHARACTER_ID, CRYO_CHARACTER_ID]),
    });

    triggerReaction(takeOne(members, 2), context);
    expect(getGildedBuffs(kitEffectState)).toStrictEqual([]);

    triggerReaction(wearer, context);
    expect(getGildedBuffs(kitEffectState)).toHaveLength(2);
  });

  test("a reaction within eight seconds of the last gives nothing new, and one after them does", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, SAME_ELEMENT_CHARACTER_ID, PYRO_CHARACTER_ID, CRYO_CHARACTER_ID]),
    });

    triggerReaction(wearer, context);
    stepKitSeconds(context, 4);
    triggerReaction(wearer, context);
    const remainingSeconds = kitEffectState.effects.flatMap((effect) =>
      effect.kind === "buff" && effect.source === "Gilded Dreams" ? [effect.secondsRemaining] : [],
    );
    expect(remainingSeconds).toStrictEqual([expect.closeTo(4), expect.closeTo(4)]);

    stepKitSeconds(context, 4.1);
    triggerReaction(wearer, context);
    expect(getGildedBuffs(kitEffectState)).toHaveLength(2);
  });
});
