import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { RETRACING_BOLIDE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createRetracingBolideSetModule } from "#src/services/artifact/sets/createRetracingBolideSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createRetracingBolideSetModule, () => {
  const OTHER_CHARACTER_ID = 2;
  const wearer = createSetWearer(TRAVELER_KIT);
  const deployed = (isOnField: boolean): DeployedCombatant[] => [createDeployedCombatant(wearer, { isOnField })];
  const liveShield: KitEffect = { characterId: OTHER_CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 5 };
  const shieldedBonuses = [
    { amount: 0.4, attribute: Attribute.NormalAttackDamageBonus },
    { amount: 0.4, attribute: Attribute.ChargedAttackDamageBonus },
  ];

  const bonus = statTables.artifactSetDataMap
    .get(RETRACING_BOLIDE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createRetracingBolideSetModule(bonus);

  test("prices its wearer at 40% more Normal and Charged Attack DMG while a shield is live on the wearer on the field", () => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(wearer, 1, deployed(true), [liveShield])).toStrictEqual(shieldedBonuses);
  });

  test("prices nothing without a live shield, or with the wearer off the field", () => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(wearer, 1, deployed(true), [])).toStrictEqual([]);
    expect(module.getPassiveBonuses?.(wearer, 1, deployed(false), [liveShield])).toStrictEqual([]);
  });
});
