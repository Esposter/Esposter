import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { FREEZE_DECAY_RATE } from "#src/services/combat/aura/constants";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { describe, expect, test } from "vitest";

describe(applyBluntHit, () => {
  test.each([
    [1.6, []],
    [2.4, [{ reactionType: ReactionType.Shattered }]],
  ])("drains 1.8U of a %fU Freeze with Razor's 300 poise damage before shattering what is left", (gauge, reactions) => {
    expect.hasAssertions();

    const state = createElementalState();
    state.auras.set(AuraType.Freeze, { decayRate: FREEZE_DECAY_RATE, gauge });

    expect(applyBluntHit(state, 300)).toStrictEqual(reactions);
    expect(state.auras.has(AuraType.Freeze)).toBe(false);
  });
});
