import type { Object3D, SkinnedMesh } from "three";

import { findSkinnedMesh } from "genshin-engine";

// The skinned mesh a body holds, found again only after a child is added to or taken from a node of the body's tree. A model
// Arrives and is taken away as a child, which three reports on its parent at any depth, so the finder listens on every node
// It has walked, and a skinned mesh attached deeper under a model is found once that model arrives
export const createSkinnedMeshFinder = (body: Object3D) => {
  let isStale = true;
  let skinnedMesh: SkinnedMesh | undefined;
  const listenedNodes = new Set<Object3D>();
  const onChildAdded = ({ child }: { child: Object3D }) => {
    listen(child);
    isStale = true;
  };
  const onChildRemoved = ({ child }: { child: Object3D }) => {
    unlisten(child);
    isStale = true;
  };
  const listen = (node: Object3D): void => {
    if (listenedNodes.has(node)) return;
    listenedNodes.add(node);
    node.addEventListener("childadded", onChildAdded);
    node.addEventListener("childremoved", onChildRemoved);
    for (const child of node.children) listen(child);
  };
  const unlisten = (node: Object3D): void => {
    if (!listenedNodes.delete(node)) return;
    node.removeEventListener("childadded", onChildAdded);
    node.removeEventListener("childremoved", onChildRemoved);
    for (const child of node.children) unlisten(child);
  };
  listen(body);
  return {
    dispose: () => {
      for (const node of listenedNodes) unlisten(node);
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
