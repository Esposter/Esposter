import { getGameOutlineOffset } from "#src/models/nodes/getGameOutlineOffset";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(getGameOutlineOffset, () => {
  // A vertex on the view ray three units in front of the eye, and the offset size the game's material gives
  const VIEW_POSITION = new Vector3(0, 0, -3);
  const SIZE = 0.01;

  test("offsets nothing where the block-B flag is zero and the blue is a half, as every face vertex has", () => {
    expect.hasAssertions();

    expect(getGameOutlineOffset(VIEW_POSITION, 0.5, 0, SIZE).length()).toBe(0);
  });

  test("pushes a vertex out along its ray from the eye, not along any normal, where the flag is one", () => {
    expect.hasAssertions();

    expect(getGameOutlineOffset(VIEW_POSITION, 0.2, 1, SIZE)).toStrictEqual(new Vector3(0, 0, -SIZE));
  });

  test("scales the offset by the blue less a half where the flag is zero", () => {
    expect.hasAssertions();

    expect(getGameOutlineOffset(VIEW_POSITION, 1, 0, SIZE)).toStrictEqual(new Vector3(0, 0, -SIZE * 0.5));
  });
});
