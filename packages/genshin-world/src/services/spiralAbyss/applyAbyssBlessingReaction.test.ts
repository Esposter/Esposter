import type { AbyssBlessingState } from "#src/models/spiralAbyss/AbyssBlessingState";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";

import { ReactionType } from "#src/models/combat/ReactionType";
import { applyAbyssBlessingReaction } from "#src/services/spiralAbyss/applyAbyssBlessingReaction";
import {
  STARDREAD_COOLDOWN_SECONDS,
  STARDREAD_NAME_TEXT_HASH,
} from "#src/services/spiralAbyss/blessings/stardreadBlessing";
import { describe, expect, test } from "vitest";

const POSITION = { x: 1, z: 2 };
const SUPERCONDUCT = [{ reactionType: ReactionType.Superconduct }];
const STARDREAD_BLESSING: AbyssPeriodBlessing = {
  descriptionTextHash: 0,
  icon: "UI_TowerBlessing_107",
  nameTextHash: STARDREAD_NAME_TEXT_HASH,
};
const OTHER_BLESSING: AbyssPeriodBlessing = { ...STARDREAD_BLESSING, nameTextHash: 0 };
const INITIAL_STATE: AbyssBlessingState = { shockwavePositions: [], stardreadReadySeconds: 0 };

describe(applyAbyssBlessingReaction, () => {
  test("a Stardread Moon chamber's reaction fires a shockwave at the enemy's position", () => {
    expect.hasAssertions();

    expect(applyAbyssBlessingReaction(STARDREAD_BLESSING, INITIAL_STATE, POSITION, SUPERCONDUCT, 0)).toStrictEqual({
      shockwavePositions: [POSITION],
      stardreadReadySeconds: STARDREAD_COOLDOWN_SECONDS,
    });
  });

  test("a reaction within the shockwave's cooldown fires no second shockwave", () => {
    expect.hasAssertions();
    const fired = applyAbyssBlessingReaction(STARDREAD_BLESSING, INITIAL_STATE, POSITION, SUPERCONDUCT, 0);

    expect(
      applyAbyssBlessingReaction(STARDREAD_BLESSING, fired, POSITION, SUPERCONDUCT, STARDREAD_COOLDOWN_SECONDS / 2),
    ).toStrictEqual(fired);
  });

  test("a chamber whose blessing is not Stardread's is left as it was by a reaction", () => {
    expect.hasAssertions();

    expect(applyAbyssBlessingReaction(OTHER_BLESSING, INITIAL_STATE, POSITION, SUPERCONDUCT, 0)).toStrictEqual(
      INITIAL_STATE,
    );
  });

  test("a chamber with no period's blessing is left as it was by a reaction", () => {
    expect.hasAssertions();

    expect(applyAbyssBlessingReaction(undefined, INITIAL_STATE, POSITION, SUPERCONDUCT, 0)).toStrictEqual(
      INITIAL_STATE,
    );
  });
});
