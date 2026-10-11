import { createLandmarkCollider } from "#src/collision/createLandmarkCollider";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { Group, Mesh, TorusKnotGeometry, Vector3 } from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { describe, test } from "vitest";

// A building's few thousand triangles, and the tens of thousands of the oak's crown or a Statue of The Seven
const BENCH_TRIANGLE_COUNTS = [4000, 80_000];
// The meshes a landmark of many parts is drawn in, each its share of the triangles
const PART_COUNT = 100;
// A torus knot's triangles are twice its tubular segments times its radial ones, here five tubular to each radial
const createKnot = (triangleCount: number): Mesh => {
  const radialSegments = Math.round(Math.sqrt(triangleCount / 10));
  return new Mesh(new TorusKnotGeometry(4, 1, radialSegments * 5, radialSegments));
};
// A root holding one landmark of the triangles, drawn as one mesh or as many parts spread along a row
const createRoot = (triangleCount: number, partCount: number): Group => {
  const root = new Group();
  const landmark = new Group();
  for (let part = 0; part < partCount; part++) {
    const knot = createKnot(triangleCount / partCount);
    knot.position.x = part * 12;
    landmark.add(knot);
  }
  root.add(landmark);
  return root;
};
// Building a landmark's collider as it arrives, drawn as one mesh against many parts, and then the queries a frame asks
// Of it: a capsule pushed out of the knot's tube and a sphere cast in from outside it
describe(createLandmarkCollider, () => {
  test.for(BENCH_TRIANGLE_COUNTS)("%i triangles, built", async (triangleCount, { bench }) => {
    const oneMeshRoot = createRoot(triangleCount, 1);
    const partsRoot = createRoot(triangleCount, PART_COUNT);
    await bench.compare(
      bench("one mesh", () => {
        createLandmarkCollider().syncLandmarks(oneMeshRoot);
      }),
      bench(`${PART_COUNT} parts`, () => {
        createLandmarkCollider().syncLandmarks(partsRoot);
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 10, warmupIterations: 2 },
    );
  });

  test.for(BENCH_TRIANGLE_COUNTS)("%i triangles, queried", async (triangleCount, { bench }) => {
    const landmarkCollider = createLandmarkCollider();
    landmarkCollider.syncLandmarks(createRoot(triangleCount, 1));
    const capsule = new Capsule(new Vector3(5, 0, 0), new Vector3(5, 0.5, 0), 0.3);
    const origin = new Vector3(6, 0, 20);
    const direction = new Vector3(0, 0, -1);
    await bench.compare(
      bench("push a capsule", () => {
        landmarkCollider.pushCapsule(capsule);
      }),
      bench("cast a sphere", () => {
        landmarkCollider.castSphere(origin, direction, 30, 0.2);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
