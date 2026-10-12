import type { CapsulePush } from "#src/models/collision/CapsulePush";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Object3D } from "three";
import type { ExtendedTriangle } from "three-mesh-bvh";

import { SPHERE_CAST_STRIDE_SHARE } from "#src/collision/constants";
import { Box3, BufferAttribute, BufferGeometry, Matrix4, Mesh, Sphere, Vector3 } from "three";
import { MeshBVH } from "three-mesh-bvh";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";

// A landmark's hierarchy over its triangles, and the bounds of them all, which a query tests before walking it
interface LandmarkVolume {
  bounds: Box3;
  bvh: MeshBVH;
}
// A landmark's triangles merged into one geometry in the root's frame, each mesh's positions transformed once and its
// Index offset past the vertices of the meshes before it, or nothing where it has no mesh yet
const buildLandmarkGeometry = (landmark: Object3D, rootInverse: Matrix4): BufferGeometry | undefined => {
  const meshes: { mesh: Mesh; meshCornerCount: number }[] = [];
  let vertexCount = 0;
  let cornerCount = 0;
  landmark.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const position = object.geometry.getAttribute("position");
    const index = object.geometry.getIndex();
    const meshCornerCount = Math.floor((index ? index.count : position.count) / 3) * 3;
    meshes.push({ mesh: object, meshCornerCount });
    vertexCount += position.count;
    cornerCount += meshCornerCount;
  });
  if (cornerCount === 0) return undefined;
  const positions = new Float32Array(vertexCount * 3);
  const corners = new Uint32Array(cornerCount);
  const matrix = new Matrix4();
  const vertex = new Vector3();
  let vertexOffset = 0;
  let cornerOffset = 0;
  for (const { mesh, meshCornerCount } of meshes) {
    matrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
    const position = mesh.geometry.getAttribute("position");
    const index = mesh.geometry.getIndex();
    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex++)
      vertex
        .fromBufferAttribute(position, vertexIndex)
        .applyMatrix4(matrix)
        .toArray(positions, (vertexOffset + vertexIndex) * 3);
    for (let corner = 0; corner < meshCornerCount; corner++)
      corners[cornerOffset + corner] = vertexOffset + (index ? index.getX(corner) : corner);
    vertexOffset += position.count;
    cornerOffset += meshCornerCount;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(corners, 1));
  return geometry;
};
// The landmarks a body stands on and climbs and a camera is pulled in by, each built once as it arrives into a bounding
// Volume hierarchy over its triangles, in the frame of the group the landmarks are placed in, which the floating origin
// Moves without moving their frame. A query walks only the landmarks whose bounds it reaches, and down each only the
// Nodes it reaches, testing each triangle there as three's octree tests one
export const createLandmarkCollider = (): LandmarkCollider => {
  const landmarkVolumeMap = new Map<Object3D, LandmarkVolume>();
  const rootInverse = new Matrix4();
  // Three's octree, never built, held for its tests of one triangle against a capsule and against a sphere
  const triangleTests = new Octree();
  const pushedCapsule = new Capsule();
  // The capsule as it stood when a landmark's walk began, which picks the triangles the walk tests
  const reachingCapsule = new Capsule();
  const center = new Vector3();
  const sphere = new Sphere();
  const capsulePush: CapsulePush = { depth: 0, normal: new Vector3() };
  let isTouching = false;
  // Each triangle the capsule overlaps pushes it out before the next is tested, among those the capsule reached as the
  // Walk began
  const pushCallbacks = {
    intersectsBounds: (box: Box3): boolean => reachingCapsule.intersectsBox(box),
    intersectsTriangle: (triangle: ExtendedTriangle): boolean => {
      const intersection = triangleTests.triangleCapsuleIntersect(pushedCapsule, triangle);
      if (!intersection) return false;
      pushedCapsule.translate(intersection.normal.multiplyScalar(intersection.depth));
      isTouching = true;
      return false;
    },
  };
  // Stops at the first triangle the sphere touches
  const sphereCallbacks = {
    intersectsBounds: (box: Box3): boolean => sphere.intersectsBox(box),
    intersectsTriangle: (triangle: ExtendedTriangle): boolean =>
      triangleTests.triangleSphereIntersect(sphere, triangle) !== false,
  };
  const checkIsSphereTouching = (): boolean => {
    for (const { bounds, bvh } of landmarkVolumeMap.values())
      if (sphere.intersectsBox(bounds) && bvh.shapecast(sphereCallbacks)) return true;
    return false;
  };
  return {
    castSphere: (origin, direction, distance, radius) => {
      const stride = radius * SPHERE_CAST_STRIDE_SHARE;
      const strideCount = Math.ceil(distance / stride);
      sphere.radius = radius;
      for (let strideIndex = 0; strideIndex <= strideCount; strideIndex++) {
        const travelled = Math.min(strideIndex * stride, distance);
        sphere.center.copy(origin).addScaledVector(direction, travelled);
        if (checkIsSphereTouching()) return Math.max(0, travelled - stride);
      }
      return distance;
    },
    pushCapsule: (capsule) => {
      pushedCapsule.copy(capsule);
      isTouching = false;
      for (const { bounds, bvh } of landmarkVolumeMap.values()) {
        if (!pushedCapsule.intersectsBox(bounds)) continue;
        reachingCapsule.copy(pushedCapsule);
        bvh.shapecast(pushCallbacks);
      }
      if (!isTouching) return undefined;
      pushedCapsule.getCenter(capsulePush.normal).sub(capsule.getCenter(center));
      capsulePush.depth = capsulePush.normal.length();
      capsulePush.normal.normalize();
      return capsulePush;
    },
    syncLandmarks: (root) => {
      for (const landmark of landmarkVolumeMap.keys()) if (landmark.parent !== root) landmarkVolumeMap.delete(landmark);
      root.updateWorldMatrix(true, true);
      rootInverse.copy(root.matrixWorld).invert();
      for (const landmark of root.children) {
        if (landmarkVolumeMap.has(landmark)) continue;
        const geometry = buildLandmarkGeometry(landmark, rootInverse);
        if (!geometry) continue;
        const bvh = new MeshBVH(geometry);
        landmarkVolumeMap.set(landmark, { bounds: bvh.getBoundingBox(new Box3()), bvh });
      }
    },
  };
};
