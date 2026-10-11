import { ANIMATION_COMPLETE_EVENT_PREFIX } from "#src/services/shared/constants";
import { Animations } from "phaser";
import { describe, expect, test } from "vitest";

describe("constants", () => {
  test("aNIMATION_COMPLETE_EVENT_PREFIX is the prefix Phaser names its completion events with", () => {
    expect.hasAssertions();

    expect(ANIMATION_COMPLETE_EVENT_PREFIX).toBe(Animations.Events.ANIMATION_COMPLETE_KEY);
  });
});
