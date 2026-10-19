import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { consumeKitResource } from "#src/services/kit/effects/consumeKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { describe, expect, test } from "vitest";

describe(consumeKitResource, () => {
  const CHARACTER_ID = 1;
  const RESOURCE_ID = "resource";

  test("spends the amount a character holds of a resource and keeps the rest", () => {
    expect.hasAssertions();

    const kitEffectState = { effects: [] };
    gainKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 8, 8);

    expect(consumeKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1)).toBe(true);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, RESOURCE_ID)).toBe(7);
  });

  test("spends nothing and reports false when a character holds less than the amount", () => {
    expect.hasAssertions();

    const kitEffectState = { effects: [] };
    gainKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1, 8);

    expect(consumeKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 2)).toBe(false);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, RESOURCE_ID)).toBe(1);
  });

  test("drops the resource once its last stack is spent", () => {
    expect.hasAssertions();

    const kitEffectState = { effects: [] };
    gainKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1, 8);

    expect(consumeKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1)).toBe(true);
    expect(countKitResource(kitEffectState.effects, CHARACTER_ID, RESOURCE_ID)).toBe(0);
    expect(kitEffectState.effects).toHaveLength(0);
  });

  test("keeps the swap end and the Nightsoul rate of a status when a stack is spent", () => {
    expect.hasAssertions();

    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, CHARACTER_ID, {
      id: RESOURCE_ID,
      isEndedOnSwap: true,
      nightsoulRate: { maximum: 90, perSecond: -1 },
      secondsRemaining: 16,
      stacks: 8,
    });

    expect(consumeKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1)).toBe(true);
    expect(findKitStatus(kitEffectState.effects, CHARACTER_ID, RESOURCE_ID)).toStrictEqual({
      characterId: CHARACTER_ID,
      id: RESOURCE_ID,
      isEndedOnSwap: true,
      kind: "status",
      nightsoulRate: { maximum: 90, perSecond: -1 },
      secondsRemaining: 16,
      stacks: 7,
    });
  });
});
