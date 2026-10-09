import type { Object3D } from "three";
import type { Node } from "three/webgpu";

import { ObjectSurface } from "#src/models/nodes/ObjectSurface";
import { OBJECT_SURFACE_KEY, SURFACE_OCTAVE_TEXEL_FREQUENCIES } from "#src/nodes/constants";
import { createSurfaceDetailNode } from "#src/nodes/createSurfaceDetailNode";
import { Color } from "three";
import { uniform, vertexColor } from "three/tsl";

// What a mesh carrying no surface is drawn in, as a material draws without a colour of its own
const DEFAULT_SURFACE = new ObjectSurface(new Color(0xffffff), []);

const readObjectSurface = (object: null | Object3D): ObjectSurface => {
  const surface: unknown = object?.userData[OBJECT_SURFACE_KEY];
  return surface instanceof ObjectSurface ? surface : DEFAULT_SURFACE;
};

// The colour and detail of each mesh drawn, read off its own surface (`setObjectSurface`) as three draws it into the
// Uniforms each drawn object holds, so one material and one program draw every part that differs only in its surface.
// A geometry that carries its own colours (a statue's stacks) is drawn in them too, and one that carries none in white
export const createObjectSurfaceNode = (): Node<"vec3"> =>
  vertexColor()
    .rgb.mul(uniform(new Color()).onObjectUpdate(({ object }) => readObjectSurface(object).color))
    .mul(
      createSurfaceDetailNode(
        SURFACE_OCTAVE_TEXEL_FREQUENCIES.map((_frequency, octave) =>
          uniform(0).onObjectUpdate(({ object }) => readObjectSurface(object).amplitudes[octave] ?? 0),
        ),
      ),
    );
