import { type Object3D, SkinnedMesh } from "three";

// The first skinned mesh within an object, which is a PMX model's own mesh once its file has arrived
export const findSkinnedMesh = (object: Object3D): SkinnedMesh | undefined => {
  if (object instanceof SkinnedMesh) return object;
  for (const child of object.children) {
    const skinnedMesh = findSkinnedMesh(child);
    if (skinnedMesh) return skinnedMesh;
  }
  return undefined;
};
