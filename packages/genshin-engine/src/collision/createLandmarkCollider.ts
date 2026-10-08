import type { CapsulePush } from "#src/models/collision/CapsulePush";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Object3D } from "three";

import { SPHERE_CAST_STRIDE_SHARE } from "#src/collision/constants";
import { Matrix4, Mesh, Sphere, Triangle, Vector3 } from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";

// A landmark's triangles in the root's frame, held in an octree, or nothing where it has no mesh yet
const buildOctree = (landmark: Object3D, rootInverse: Matrix4): Octree | undefined => {
  const octree = new Octree();
  const matrix = new Matrix4();
  landmark.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    matrix.multiplyMatrices(rootInverse, object.matrixWorld);
    const position = object.geometry.getAttribute("position");
    const index = object.geometry.getIndex();
    const count = index ? index.count : position.count;
    const readCorner = (corner: number): Vector3 =>
      new Vector3().fromBufferAttribute(position, index ? index.getX(corner) : corner).applyMatrix4(matrix);
    for (let corner = 0; corner + 2 < count; corner += 3)
      octree.addTriangle(new Triangle(readCorner(corner), readCorner(corner + 1), readCorner(corner + 2)));
  });
  return octree.triangles.length > 0 ? octree.build() : undefined;
};
// The landmarks a body stands on and climbs and a camera is pulled in by, each built once as it arrives, in the frame of
// The group the landmarks are placed in, which the floating origin moves without moving their frame. A query tests only
// The landmarks whose bounds it reaches, and allocates nothing until something touches
export const createLandmarkCollider = (): LandmarkCollider => {
  const landmarkOctreeMap = new Map<Object3D, Octree>();
  const rootInverse = new Matrix4();
  const triangles: Triangle[] = [];
  const pushedCapsule = new Capsule();
  const center = new Vector3();
  const sphere = new Sphere();
  const capsulePush: CapsulePush = { depth: 0, normal: new Vector3() };
  const checkIsSphereTouching = (): boolean => {
    for (const octree of landmarkOctreeMap.values()) {
      if (!sphere.intersectsBox(octree.bounds)) continue;
      triangles.length = 0;
      octree.getSphereTriangles(sphere, triangles);
      if (triangles.some((triangle) => octree.triangleSphereIntersect(sphere, triangle))) return true;
    }
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
      let isTouching = false;
      for (const octree of landmarkOctreeMap.values()) {
        if (!pushedCapsule.intersectsBox(octree.bounds)) continue;
        triangles.length = 0;
        octree.getCapsuleTriangles(pushedCapsule, triangles);
        for (const triangle of triangles) {
          const intersection = octree.triangleCapsuleIntersect(pushedCapsule, triangle);
          if (!intersection) continue;
          pushedCapsule.translate(intersection.normal.multiplyScalar(intersection.depth));
          isTouching = true;
        }
      }
      if (!isTouching) return undefined;
      pushedCapsule.getCenter(capsulePush.normal).sub(capsule.getCenter(center));
      capsulePush.depth = capsulePush.normal.length();
      capsulePush.normal.normalize();
      return capsulePush;
    },
    syncLandmarks: (root) => {
      for (const landmark of landmarkOctreeMap.keys()) if (landmark.parent !== root) landmarkOctreeMap.delete(landmark);
      root.updateWorldMatrix(true, true);
      rootInverse.copy(root.matrixWorld).invert();
      for (const landmark of root.children) {
        if (landmarkOctreeMap.has(landmark)) continue;
        const octree = buildOctree(landmark, rootInverse);
        if (octree) landmarkOctreeMap.set(landmark, octree);
      }
    },
  };
};
