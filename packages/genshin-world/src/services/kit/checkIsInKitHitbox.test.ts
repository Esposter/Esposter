import type { KitHitbox } from "#src/models/kit/KitHitbox";

import { checkIsInKitHitbox } from "#src/services/kit/checkIsInKitHitbox";
import { describe, expect, test } from "vitest";

describe(checkIsInKitHitbox, () => {
  test.each([
    {
      enemy: { x: 0, z: 0 },
      expected: true,
      hitbox: { offset: { x: -2.5, z: 2.5 }, shape: { kind: "circle", radius: 4.5 } } satisfies KitHitbox,
      name: "a circle reaches its target, which stands within its radius of the offset centre",
    },
    {
      enemy: { x: 0, z: -6 },
      expected: false,
      hitbox: { offset: { x: -2.5, z: 2.5 }, shape: { kind: "circle", radius: 4.5 } } satisfies KitHitbox,
      name: "a circle misses an enemy beyond its radius from the offset centre",
    },
    {
      enemy: { x: 0, z: 0 },
      expected: true,
      hitbox: { offset: { x: -1.5, z: 2.5 }, shape: { kind: "box", length: 8, width: 3 } } satisfies KitHitbox,
      name: "a box reaches its target at the edge of its width",
    },
    {
      enemy: { x: 3, z: 0 },
      expected: false,
      hitbox: { offset: { x: -1.5, z: 2.5 }, shape: { kind: "box", length: 8, width: 3 } } satisfies KitHitbox,
      name: "a box misses an enemy beyond its width",
    },
  ])("$name", ({ enemy, expected, hitbox }) => {
    expect.hasAssertions();
    expect(checkIsInKitHitbox(hitbox, { x: 0, z: 0 }, enemy)).toBe(expected);
  });
});
