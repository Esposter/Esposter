// The scene's drawn objects by kind, a kind hidden and shown again, and a wait of some frames that names the frames it
// Waited, so the GPU's time on each pass can be read with each kind gone. An object's kind is the component whose
// Template holds the nearest of its ancestors any template holds, named by its file under `components` with `Index.vue`
// Dropped, as the development server names a component's file; what no template holds, such as what a composable adds
// To the scene itself, is the scene's own. A kind is hidden by clearing its objects' layers, which every pass tests
// Against its camera's, rather than their `visible`, which a fade or a terrain ring sets again each frame. Only an object
// That draws is counted, among those drawn now. Run once the renderer and the scene are handed over; a string, as the
// Other trace scripts are
export const TRACE_KINDS_SCRIPT = `
  (() => {
    const kindDrawables = new Map();
    const layerMasks = new Map();
    window.__sceneKinds = () => {
      const scene = window.__scene;
      const objectKinds = new Map();
      const visit = (vnode, kind) => {
        if (!vnode) return;
        if (vnode.component) {
          const match = /components\\/(.+?)(?:\\/Index)?\\.vue$/.exec(vnode.component.type.__file ?? "");
          visit(vnode.component.subTree, match ? match[1] : kind);
          return;
        }
        if (vnode.suspense) visit(vnode.suspense.activeBranch, kind);
        const element = vnode.el?.isPrimitive ? vnode.el.object : vnode.el;
        if (element?.isObject3D) objectKinds.set(element, kind);
        if (Array.isArray(vnode.children)) for (const child of vnode.children) visit(child, kind);
      };
      visit(scene._vnode, "scene");
      kindDrawables.clear();
      scene.traverseVisible((object) => {
        if (!object.isMesh && !object.isSprite && !object.isPoints && !object.isLine) return;
        let holder = object;
        while (holder && !objectKinds.has(holder)) holder = holder.parent;
        const kind = holder ? objectKinds.get(holder) : "scene";
        kindDrawables.set(kind, [...(kindDrawables.get(kind) ?? []), object]);
      });
      return [...kindDrawables].map(([kind, objects]) => ({ drawables: objects.length, kind }));
    };
    window.__setSceneKindHidden = (kind, isHidden) => {
      for (const object of kindDrawables.get(kind) ?? []) {
        if (isHidden) {
          layerMasks.set(object, object.layers.mask);
          object.layers.disableAll();
        } else object.layers.mask = layerMasks.get(object) ?? object.layers.mask;
      }
    };
    window.__waitFrames = (count) =>
      new Promise((resolve) => {
        const firstFrame = window.__traceTimes.length;
        const check = () => {
          if (window.__traceTimes.length - firstFrame >= count) resolve({ endFrame: firstFrame + count, firstFrame });
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
  })();
`;
