import { applyMusicExpression } from "#src/services/genshinParity/applyMusicExpression";
import { describe, expect, test } from "vitest";

describe(applyMusicExpression, () => {
  test("moves the gain between the windows' centres and holds it past the last", () => {
    expect.hasAssertions();

    expect(applyMusicExpression(Float32Array.of(1, 1, 1), 1, [0, 20], 1)).toStrictEqual(
      Float32Array.of(1, 10 ** 0.5, 10),
    );
  });
});
