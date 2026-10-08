import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { describe, expect, test } from "vitest";

describe(findShadowEdges, () => {
  const WIDTH = 4;
  const HEIGHT = 2;

  test("marks each shadowed receiver beside a lit one, on the shadow's side alone", () => {
    expect.hasAssertions();

    const isShadowed = Uint8Array.from([1, 1, 0, 0, 1, 1, 0, 0]);
    const isReceiver = new Uint8Array(WIDTH * HEIGHT).fill(1);

    expect(findShadowEdges(isShadowed, isReceiver, WIDTH, HEIGHT)).toStrictEqual(
      Uint8Array.from([0, 1, 0, 0, 0, 1, 0, 0]),
    );
  });

  test("marks no edge where a shadow runs off its receiver", () => {
    expect.hasAssertions();

    const isShadowed = Uint8Array.from([1, 1, 0, 0, 1, 1, 0, 0]);
    const isReceiver = Uint8Array.from([1, 1, 0, 0, 1, 1, 0, 0]);

    expect(findShadowEdges(isShadowed, isReceiver, WIDTH, HEIGHT)).toStrictEqual(new Uint8Array(WIDTH * HEIGHT));
  });
});
