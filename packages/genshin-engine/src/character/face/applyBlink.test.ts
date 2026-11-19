import { applyBlink } from "#src/character/face/applyBlink";
import { FACE_BLINK_MORPH_NAME, FACE_BLINK_SECONDS } from "#src/character/face/constants";
import { Mesh } from "three";
import { describe, expect, test } from "vitest";

describe(applyBlink, () => {
  test("a blink closes the eyes and opens them again", () => {
    expect.hasAssertions();

    const mesh = new Mesh();
    mesh.morphTargetDictionary = { [FACE_BLINK_MORPH_NAME]: 0 };
    mesh.morphTargetInfluences = [0];

    applyBlink(mesh, FACE_BLINK_SECONDS / 2);
    expect(mesh.morphTargetInfluences).toStrictEqual([1]);

    applyBlink(mesh, FACE_BLINK_SECONDS);
    expect(mesh.morphTargetInfluences).toStrictEqual([0]);
  });
});
