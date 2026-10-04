import { scheduleMusicExpression } from "#src/audio/scheduleMusicExpression";
import { describe, expect, test, vi } from "vitest";

const createGain = () => ({
  exponentialRampToValueAtTime: vi.fn<AudioParam["exponentialRampToValueAtTime"]>(),
  setValueAtTime: vi.fn<AudioParam["setValueAtTime"]>(),
});

describe(scheduleMusicExpression, () => {
  test("holds a single window from the start with no event past it", () => {
    expect.hasAssertions();

    const gain = createGain();
    scheduleMusicExpression(gain as unknown as AudioParam, [20], 1);

    expect(gain.setValueAtTime).toHaveBeenCalledExactlyOnceWith(10, 1);
    expect(gain.exponentialRampToValueAtTime).not.toHaveBeenCalled();
  });

  test("ramps from each window's centre to the next", () => {
    expect.hasAssertions();

    const gain = createGain();
    scheduleMusicExpression(gain as unknown as AudioParam, [0, 20], 0);

    expect(gain.setValueAtTime.mock.calls).toStrictEqual([
      [1, 0],
      [1, 4],
    ]);
    expect(gain.exponentialRampToValueAtTime).toHaveBeenCalledExactlyOnceWith(10, 12);
  });
});
