import { createKitTaunt } from "#src/services/kit/effects/createKitTaunt.test";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";
import { describe, expect, test } from "vitest";

describe(stepKitTaunt, () => {
  test("strikes nothing while its health and seconds last, then explodes once when either runs out", () => {
    expect.hasAssertions();
    const taunt = createKitTaunt(100, 5);
    expect(stepKitTaunt(taunt)).toBeUndefined();
    damageKitTaunt([], taunt, 150);
    expect(taunt.health).toBe(0);
    expect(stepKitTaunt(taunt)).toBeDefined();
    expect(taunt.secondsRemaining).toBe(0);
  });

  test("ends striking nothing when it carries no explosion", () => {
    expect.hasAssertions();
    const { explosion: _explosion, ...taunt } = createKitTaunt(100, 0);

    expect(stepKitTaunt(taunt)).toBeUndefined();
    expect(taunt.secondsRemaining).toBe(0);
  });
});
