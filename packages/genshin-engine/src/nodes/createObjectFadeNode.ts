import type { Node } from "three/webgpu";

import { OBJECT_FADE_KEY } from "#src/nodes/constants";
import { uniform } from "three/tsl";

// How far each mesh drawn has faded in, from none to all, read off its own fade (`setObjectFade`) as three draws it
// Into the uniforms each drawn object holds, so one material fades many objects, each by its own
export const createObjectFadeNode = (): Node<"float"> =>
  uniform(0).onObjectUpdate(({ object }) => {
    const fade: unknown = object?.userData[OBJECT_FADE_KEY];
    return typeof fade === "number" ? fade : 0;
  });
