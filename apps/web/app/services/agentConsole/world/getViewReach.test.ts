import { getViewReach } from "@/services/agentConsole/world/getViewReach";
import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// A right angle wide and high, so the far plane's corners stand as far to each side as it stands ahead
const createCamera = (position: Vector3, target: Vector3) => {
  const camera = new PerspectiveCamera(90, 1, 1, 10);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  return camera;
};

describe(getViewReach, () => {
  test("reaches the far plane's corners", () => {
    expect.hasAssertions();

    const position = new Vector3(0, 11, 0);
    const camera = createCamera(position, new Vector3(0, 11, -1));
    const reach = getViewReach(camera, position);

    expect(reach).toBeCloseTo(Math.hypot(10, 10));
  });

  test("stops at the world's floor", () => {
    expect.hasAssertions();

    // Looking straight down from five voxels up, the frustum meets the floor five voxels out each way
    const position = new Vector3(0, 5, 0);
    const camera = createCamera(position, new Vector3(0, 0, 0));
    const reach = getViewReach(camera, position);

    expect(reach).toBeCloseTo(Math.hypot(5, 5));
  });
});
