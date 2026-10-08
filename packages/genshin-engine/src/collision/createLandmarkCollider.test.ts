import { createLandmarkCollider } from "#src/collision/createLandmarkCollider";
import { BoxGeometry, Group, Mesh, Vector3 } from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { describe, expect, test } from "vitest";

// A two metre cube whose west face stands at x = 9 in its root's frame, in a root the floating origin has moved
const createRoot = (): Group => {
  const root = new Group();
  root.position.set(-100, 0, 0);
  const landmark = new Group();
  landmark.position.set(10, 0, 0);
  landmark.add(new Mesh(new BoxGeometry(2, 2, 2)));
  root.add(landmark);
  return root;
};

describe(createLandmarkCollider, () => {
  const RADIUS = 0.5;

  test("pushes a capsule out of a landmark's face along its normal, in the root's frame", () => {
    expect.hasAssertions();

    const landmarkCollider = createLandmarkCollider();
    landmarkCollider.syncLandmarks(createRoot());
    const capsulePush = landmarkCollider.pushCapsule(
      new Capsule(new Vector3(8.75, 0, 0), new Vector3(8.75, 0.5, 0), RADIUS),
    );

    expect(capsulePush?.depth).toBeCloseTo(0.25, 9);
    expect(capsulePush?.normal.toArray()).toStrictEqual([-1, 0, 0]);
  });

  test("lets go of a landmark no longer among the root's children", () => {
    expect.hasAssertions();

    const landmarkCollider = createLandmarkCollider();
    const root = createRoot();
    landmarkCollider.syncLandmarks(root);
    root.clear();
    landmarkCollider.syncLandmarks(root);

    expect(
      landmarkCollider.pushCapsule(new Capsule(new Vector3(8.75, 0, 0), new Vector3(8.75, 0.5, 0), RADIUS)),
    ).toBeUndefined();
  });

  test("casts a sphere until it touches a landmark", () => {
    expect.hasAssertions();

    const landmarkCollider = createLandmarkCollider();
    landmarkCollider.syncLandmarks(createRoot());
    const travelled = landmarkCollider.castSphere(new Vector3(0, 0, 0), new Vector3(1, 0, 0), 20, RADIUS);

    expect(travelled).toBeGreaterThan(9 - RADIUS * 2);
    expect(travelled).toBeLessThanOrEqual(9 - RADIUS);
  });
});
