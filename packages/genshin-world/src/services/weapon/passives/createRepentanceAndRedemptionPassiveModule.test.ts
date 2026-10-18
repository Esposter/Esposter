import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createRepentanceAndRedemptionPassiveModule } from "#src/services/weapon/passives/createRepentanceAndRedemptionPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Repentance and Redemption, Blade of Atonement at its first rank: sixty-four Elemental Mastery for an Elemental Reaction,
// And sixteen per cent ATK for a Stellar Glimmer reaction, each for twelve seconds
const repentanceAndRedemptionPassiveModule = createRepentanceAndRedemptionPassiveModule([64, 12, 0.16, 12]);
const createReaction = (reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element, reactionType }],
  striker: wielder,
});
const getBuffs = (effects: readonly KitEffect[]) => effects.filter(({ kind }) => kind === "buff");

describe(createRepentanceAndRedemptionPassiveModule, () => {
  test("an Elemental Reaction the wielder triggers raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toContainEqual({
      amount: 64,
      attribute: Attribute.ElementalMastery,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
      source: "repentanceAndRedemption",
    });
  });

  test("a Stellar Glimmer reaction the wielder triggers raises its ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.StellarSwirl, Element.Anemo),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toContainEqual({
      amount: 0.16,
      attribute: Attribute.AttackPercent,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
      source: "repentanceAndRedemption",
    });
  });

  test("an Elemental Reaction that is not a Stellar Glimmer one raises no ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects).map(({ attribute }) => attribute)).not.toContain(
      Attribute.AttackPercent,
    );
  });
});
