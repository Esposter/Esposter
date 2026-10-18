import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { consumeKitResource } from "#src/services/kit/effects/consumeKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 10_000_093;
const RESOURCE_ID = "xianyun-test-resource";

describe(consumeKitResource, () => {
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

  test("keeps the seconds a timed resource runs for when a stack is spent", () => {
    expect.hasAssertions();

    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, CHARACTER_ID, { id: RESOURCE_ID, secondsRemaining: 16, stacks: 8 });

    expect(consumeKitResource(kitEffectState, CHARACTER_ID, RESOURCE_ID, 1)).toBe(true);
    const status = findKitStatus(kitEffectState.effects, CHARACTER_ID, RESOURCE_ID);
    expect(status?.secondsRemaining).toBe(16);
    expect(status?.stacks).toBe(7);
  });
});
