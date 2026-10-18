import type { Object3D } from "three";

import { SkinnedMesh } from "three";

// The first skinned mesh within an object, which is a PMX model's own mesh once its file has arrived
export const findSkinnedMesh = (object: Object3D): SkinnedMesh | undefined => {
  if (object instanceof SkinnedMesh) return object;
  for (const child of object.children) {
    const skinnedMesh = findSkinnedMesh(child);
    if (skinnedMesh) return skinnedMesh;
  }
  return undefined;
};

// The same search as a finder that walks the object again only when its tree changes. A model arrives or is taken away by
// Adding or removing a child, which three announces on the child's parent, at any depth, so the finder listens on every
// Node it has walked and marks itself stale on either event; the next call walks once more and finds nothing else
export const createSkinnedMeshFinder = (object: Object3D): (() => SkinnedMesh | undefined) => {
  const listenedNodes = new WeakSet<Object3D>();
  let isStale = true;
  let skinnedMesh: SkinnedMesh | undefined;
  const listen = (node: Object3D): void => {
    if (listenedNodes.has(node)) return;
    listenedNodes.add(node);
    node.addEventListener("childadded", ({ child }) => {
      listen(child);
      isStale = true;
    });
    node.addEventListener("childremoved", () => {
      isStale = true;
    });
    for (const child of node.children) listen(child);
  };
  return () => {
    if (isStale) {
      listen(object);
      skinnedMesh = findSkinnedMesh(object);
      isStale = false;
    }
    return skinnedMesh;
  };
};
