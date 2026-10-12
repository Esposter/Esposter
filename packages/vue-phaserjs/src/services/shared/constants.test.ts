import { ANIMATION_COMPLETE_EVENT_PREFIX } from "#src/services/shared/constants";
import { Animations } from "phaser";
import { describe, expect, test } from "vitest";

describe("constants", () => {
  test("the animation completion prefix is the one Phaser names its completion events with", () => {
    expect.hasAssertions();

    expect(ANIMATION_COMPLETE_EVENT_PREFIX).toBe(Animations.Events.ANIMATION_COMPLETE_KEY);
  });
});
