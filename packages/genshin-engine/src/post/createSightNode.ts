import type { SightUniforms } from "#src/models/post/SightUniforms";
import type { Camera } from "three";
import type { Node, PassNode, TextureNode } from "three/webgpu";

import { abs, dot, float, Fn, getViewPosition, If, mix, smoothstep, uniform, uv, vec3, vec4 } from "three/tsl";

// Provisional: how much of its luminance a muted thing keeps, the colour gone with it, until a recording of the sight
// Toggled on the game's street measures the game's dark
const SIGHT_MUTE_BRIGHTNESS = 0.25;
// Provisional: how far a lit thing's own colour takes its pixel from the scene's, until a recording measures the highlight
const SIGHT_HIGHLIGHT_STRENGTH = 0.85;
// Provisional: the ring's width in metres, until a recording of its spread measures it
const SIGHT_RING_WIDTH = 0.6;
// How near in depth a lit thing must lie to the scene's pixel to be the thing shown, so a thing behind a wall stays muted
const SIGHT_DEPTH_TOLERANCE = 0.0001;
// The sight over the scene, a pass after the fog. Inside its reach a thing that is lit keeps the colour it is lit in and
// Anything else is muted to a dark of its own luminance, and a white ring is drawn at the reach's edge. Outside the
// Reach the scene is what it was. Its strength is 0 while the sight is off, which leaves every pixel as it was
export const createSightNode = (
  colorNode: Node<"vec4">,
  depthNode: TextureNode,
  camera: Camera,
  litPass: PassNode,
  { origin, radius, strength }: SightUniforms,
): Node<"vec4"> => {
  const cameraWorldMatrix = uniform(camera.matrixWorld);
  const cameraProjectionMatrixInverse = uniform(camera.projectionMatrixInverse);
  const litColorNode = litPass.getTextureNode();
  const litDepthNode = litPass.getTextureNode("depth");
  return Fn(() => {
    const output = colorNode.toVar();
    const depth = depthNode.sample(uv()).r;
    If(depth.lessThan(1).and(strength.greaterThan(0)), () => {
      const viewPosition = getViewPosition(uv(), depth, cameraProjectionMatrixInverse);
      const groundPosition = cameraWorldMatrix.mul(vec4(viewPosition, 1)).xz;
      const reach = groundPosition.sub(origin).length();
      const scene = vec3(output.rgb).toVar();
      If(reach.lessThan(radius), () => {
        const sightRgb = vec3(dot(scene, vec3(0.2126, 0.7152, 0.0722)).mul(SIGHT_MUTE_BRIGHTNESS)).toVar();
        const litDepth = litDepthNode.sample(uv()).r;
        If(litDepth.lessThan(1).and(litDepth.lessThanEqual(depth.add(SIGHT_DEPTH_TOLERANCE))), () => {
          sightRgb.assign(mix(scene, litColorNode.sample(uv()).rgb, SIGHT_HIGHLIGHT_STRENGTH));
        });
        output.assign(vec4(mix(scene, sightRgb, strength), output.a));
      });
      const ringWeight = float(1).sub(smoothstep(0, SIGHT_RING_WIDTH, abs(reach.sub(radius))));
      output.assign(vec4(mix(output.rgb, vec3(1), ringWeight.mul(strength)), output.a));
    });
    return output;
  })();
};
