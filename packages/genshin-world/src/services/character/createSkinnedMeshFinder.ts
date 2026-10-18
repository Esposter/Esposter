import type { Object3D, SkinnedMesh } from "three";

import { findSkinnedMesh } from "genshin-engine";

// The skinned mesh a body holds, found again only after a child is added to or taken from the body, since a model arrives
// And is taken away as one of its children, which three reports on the body as childadded and childremoved. A skinned mesh
// Attached deeper under the body is not seen until one of its children changes
export const createSkinnedMeshFinder = (body: Object3D) => {
  let isStale = true;
  let skinnedMesh: SkinnedMesh | undefined;
  const markStale = () => {
    isStale = true;
  };
  body.addEventListener("childadded", markStale);
  body.addEventListener("childremoved", markStale);
  return {
    dispose: () => {
      body.removeEventListener("childadded", markStale);
      body.removeEventListener("childremoved", markStale);
    },
    find: (): SkinnedMesh | undefined => {
      if (isStale) {
        skinnedMesh = findSkinnedMesh(body);
        isStale = false;
      }
      return skinnedMesh;
    },
  };
};
