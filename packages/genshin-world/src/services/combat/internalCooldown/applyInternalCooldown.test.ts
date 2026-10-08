import type { InternalCooldown } from "#src/models/combat/InternalCooldown";

import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";
import { DEFAULT_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";
import { describe, expect, test } from "vitest";

const createInternalCooldown = (): InternalCooldown => ({ hitIndex: 0, startSeconds: -Infinity });

describe(applyInternalCooldown, () => {
  test("applies the 1st, 4th and 7th of seven hits inside the timer, as Yoimiya's arrows melt", () => {
    expect.hasAssertions();

    const internalCooldown = createInternalCooldown();
    const shares = Array.from({ length: 7 }, (_value, index) =>
      applyInternalCooldown(internalCooldown, DEFAULT_INTERNAL_COOLDOWN_GROUP, index * 0.3),
    );

    expect(shares).toStrictEqual([1, 0, 0, 1, 0, 0, 1]);
  });

  test("applies the first hit once the timer has run out, wherever the count stands, and counts afresh from it", () => {
    expect.hasAssertions();

    const internalCooldown = createInternalCooldown();
    const shares = [0, 1, 2.5, 2.6, 2.7, 2.8].map((seconds) =>
      applyInternalCooldown(internalCooldown, DEFAULT_INTERNAL_COOLDOWN_GROUP, seconds),
    );

    expect(shares).toStrictEqual([1, 0, 1, 0, 0, 1]);
  });

  test("applies nothing past the end of its sequence", () => {
    expect.hasAssertions();

    const internalCooldown = createInternalCooldown();
    const shares = Array.from({ length: 26 }, () =>
      applyInternalCooldown(internalCooldown, DEFAULT_INTERNAL_COOLDOWN_GROUP, 0),
    );

    expect(shares).toStrictEqual([...DEFAULT_INTERNAL_COOLDOWN_GROUP.gaugeSequence, 0, 0]);
  });
});
