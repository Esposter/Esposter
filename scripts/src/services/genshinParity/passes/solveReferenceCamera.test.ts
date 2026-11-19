import type { Page } from "playwright";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { projectWitnessPoint } from "#src/services/genshinParity/witness/projectWitnessPoint";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/witness/readReferenceLandmarks"), () => ({
  readReferenceLandmarks: vi.fn<typeof readReferenceLandmarks>(),
}));

const WIDTH = 3100;
const HEIGHT = 1300;
// The login's recorded camera, the start its exports are solved from along the glide
const RECORDED_POSE = [0, 1, -5.433, 180, 5.69, 45];
// Scene cameras of our own, nothing like the recording's: a change to them must not reach the exports' camera
const SCENE_POSE_A = [0, 1, -20, 180, 5.69, 45];
const SCENE_POSE_B = [4, 3, 6, 90, -2, 60];
const WORLD_POINTS: [number, number, number][] = [
  [0, 1, 6],
  [2.5, 3, 9],
  [-3, 0.5, 12],
];

// The landmarks a pose sees each world point at, as the witness reads them from a reference
const projectLandmarks = (pose: readonly number[], points: readonly [number, number, number][]) =>
  points.map((point) => ({ isEdge: false, pixel: projectWitnessPoint(pose, point, WIDTH, HEIGHT).pixel, point }));

// A page whose scene stands at the camera given; the landmark read is mocked, so only the scene's camera reads it
const createPage = (scenePose: readonly number[]): Page =>
  ({
    evaluate: vi.fn<() => Promise<{ fov: number; pitch: number; position: [number, number, number]; yaw: number }>>(
      () =>
        Promise.resolve({ fov: scenePose[5] ?? 0, pitch: 0, position: [0, 0, 0] as [number, number, number], yaw: 0 }),
    ),
  }) as unknown as Page;

describe(solveReferenceCamera, () => {
  test("a reference's exports stand at its recorded camera whatever the scene's camera is", async () => {
    expect.hasAssertions();

    vi.mocked(readReferenceLandmarks).mockResolvedValue({
      correspondences: projectLandmarks(RECORDED_POSE, WORLD_POINTS),
      given: [],
      height: HEIGHT,
      names: ["doorApex", "doorFootLeft", "doorFootRight"],
      waiting: [],
      width: WIDTH,
    });
    const fromA = await solveReferenceCamera(
      createPage(SCENE_POSE_A),
      "login-door-session",
      DerivedAssetComponent.Login,
    );
    const fromB = await solveReferenceCamera(
      createPage(SCENE_POSE_B),
      "login-door-session",
      DerivedAssetComponent.Login,
    );

    expect(fromA.pose).toStrictEqual(fromB.pose);
    expect(fromA.rms).toStrictEqual(fromB.rms);
    expect(fromA.pose.every((value, axis) => Math.abs(value - (RECORDED_POSE[axis] ?? 0)) < 1e-6)).toBe(true);
  });

  test("a reference that records no camera and holds fewer than six landmarks is not solved", async () => {
    expect.hasAssertions();

    vi.mocked(readReferenceLandmarks).mockResolvedValue({
      correspondences: projectLandmarks(RECORDED_POSE, WORLD_POINTS),
      given: [],
      height: HEIGHT,
      names: ["doorApex", "doorFootLeft", "doorFootRight"],
      waiting: [],
      width: WIDTH,
    });

    await expect(
      solveReferenceCamera(createPage(SCENE_POSE_A), "login-door-recording", DerivedAssetComponent.Login),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: pose, 3 correspondences: 6 or more, or a start]`,
    );
  });
});
