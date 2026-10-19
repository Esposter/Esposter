import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { SCARLETPROOF_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createReactionSetTeam } from "#src/services/artifact/sets/createReactionSetTeam.test";
import { createScarletproofSetModule } from "#src/services/artifact/sets/createScarletproofSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffAmounts } from "#src/services/weapon/passives/getBuffAmounts.test";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const OTHER_CHARACTER_ID = 2;
const createTeam = (characterIds: number[]) =>
  createReactionSetTeam(
    createScarletproofSetModule(getArtifactSetBonus(statTables, SCARLETPROOF_ARTIFACT_SET_ID, 4)),
    characterIds,
  );

describe(createScarletproofSetModule, () => {
  test("a Stellar Swirl the wearer triggers raises its own Stellar Swirl DMG by 40% for ten seconds, and another member's is not", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);

    trigger(wearer, [StellarReactionType.StellarSwirl]);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);
    expect(reactionDamageBonus(other, StellarReactionType.StellarSwirl)).toBe(0);

    stepKitSeconds(context, 9);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);

    stepKitSeconds(context, 1);
    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);
  });

  test("a Stellar Swirl the wearer triggers raises its CRIT Rate by 16% for ten seconds, restarted rather than stacked", () => {
    expect.hasAssertions();

    const { context, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl]);
    trigger(wearer, [StellarReactionType.StellarSwirl]);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([expect.closeTo(0.16)]);

    stepKitSeconds(context, 10);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([]);
  });

  test("a Stellar Swirl another member triggers, or a Swirl of another reaction, raises neither", () => {
    expect.hasAssertions();

    const { context, other, reactionDamageBonus, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    trigger(other, [StellarReactionType.StellarSwirl]);
    trigger(wearer, [ReactionType.Quicken]);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBe(0);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([]);
  });

  test("a Stellar Swirl a summon of the wearer's triggers counts as the wearer's, as gcsim's Stellar Swirl hook takes any attack of the wearer", () => {
    expect.hasAssertions();

    const { context, reactionDamageBonus, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    trigger(wearer, [StellarReactionType.StellarSwirl], true);

    expect(reactionDamageBonus(wearer, StellarReactionType.StellarSwirl)).toBeCloseTo(0.4);
    expect(getBuffAmounts(context.kitEffectState, Attribute.CriticalRate)).toStrictEqual([expect.closeTo(0.16)]);
  });
});
