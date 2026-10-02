import type { Node } from "three/webgpu";

import door from "#src/data/login/door.json";
import { SceneAxis } from "#src/models/scene/SceneAxis";
import { LOGIN_DOOR_RELIEF_CONTRAST, LOGIN_DOOR_RELIEF_PIXELS_PER_METRE } from "#src/services/login/door/constants";
import { createPlanCanvasNode } from "#src/services/login/scene/createPlanCanvasNode";
import { addSmoothLoop } from "genshin-engine";
import { mix, vec3 } from "three/tsl";

// The colour the door's front is painted over its stone, read off its texture by `fitLoginDoor`: its panel's raised
// Bands lighter than the stone round them and its feet's gilding, each filled as smooth loops in its own colour, drawn
// Once over the door's front and read where the frame's and the panel's own geometry stand on it, only on their faces
// Turned to the camera, each colour its contrast's share as far from the stone as read. A canvas holds no more than 1 a
// Channel, so each colour is drawn at half and read back doubled
export const createLoginDoorRelief = (): Node<"vec3"> => {
  const { bands, corner, gilding, size } = door.relief;
  const { sample, weight } = createPlanCanvasNode(
    {
      axes: [SceneAxis.X, SceneAxis.Y],
      corner,
      normalAxis: SceneAxis.Z,
      pixelsPerMetre: LOGIN_DOOR_RELIEF_PIXELS_PER_METRE,
      size,
    },
    (context, toCanvas) => {
      context.fillStyle = "rgb(50% 50% 50%)";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      for (const { loops, shade } of [bands, gilding]) {
        const path = new Path2D();
        for (const loop of loops)
          addSmoothLoop(
            path,
            loop.map((point) => toCanvas(point)),
          );
        const [red = 1, green = 1, blue = 1] = shade.map(
          (channel) => Math.min((1 + LOGIN_DOOR_RELIEF_CONTRAST * (channel - 1)) / 2, 1) * 100,
        );
        context.fillStyle = `rgb(${red}% ${green}% ${blue}%)`;
        // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas's fill takes a path, not an array's value
        context.fill(path, "evenodd");
      }
    },
  );
  return mix(vec3(1), sample.rgb.mul(2), weight);
};
