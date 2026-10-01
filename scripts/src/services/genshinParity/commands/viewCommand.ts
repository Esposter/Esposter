import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { viewScene } from "#src/services/genshinParity/viewScene";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { jsonDateParse } from "@esposter/shared";
import { defineCommand } from "citty";

export const viewCommand: SubCommandsDef[string] = defineCommand({
  args: {
    screen: { description: "A scene's screen with a fixture on the parity page", required: true, type: "positional" },
    camera: {
      description:
        "The eye in three's axes, then heading, pitch and vertical field of view in degrees: x,y,z,yaw,pitch,fov",
      required: true,
      type: "string",
    },
    witness: { description: "The component whose exports stand beside our parts", required: true, type: "string" },
    height: { default: "540", description: "Height to draw it at, in pixels", type: "string" },
    props: {
      description: "Props over the fixture's, as JSON: a state whose rows stand at their own places",
      type: "string",
    },
    width: { default: "960", description: "Width to draw it at, in pixels", type: "string" },
  },
  meta: { description: "A scene from any camera, our parts beside the exports they stand for", name: "view" },
  run: async ({ args }) => {
    const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 50] = parseNumbers(
      args.camera,
      "camera",
      CAMERA_POSE_AXES.length,
    );
    await viewScene({
      camera: [x, y, z, yaw, pitch, fov],
      height: Number(args.height),
      props: args.props ? jsonDateParse<Record<string, unknown>>(args.props) : {},
      screen: args.screen,
      width: Number(args.width),
      witness: parseDerivedAssetComponent(args.witness),
    });
  },
});
