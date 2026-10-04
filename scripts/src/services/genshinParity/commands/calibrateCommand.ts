import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { CAMERA_POSE_AXES, GBUFFER_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { readReferenceGbuffer } from "#src/services/genshinParity/shared/readReferenceGbuffer";
import { calibrateScene } from "#src/services/genshinParity/witness/calibrateScene";
import { toPageCamera } from "#src/services/genshinParity/witness/toPageCamera";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const formatColor = (color: readonly number[]): string => color.map((value) => value.toFixed(3)).join(", ");

export const calibrateCommand: SubCommandsDef[string] = defineCommand({
  args: {
    luts: { description: "A folder of grading tables (PNG strips) to score against the fitted frame", type: "string" },
    pose: {
      description: `A pose in place of the reference's, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      type: "string",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Fit a reference's light, fog and grade by least squares over the witness's G-buffer, printing each term with its residual and scoring each grading table given",
    name: "calibrate",
  },
  run: async ({ args }) => {
    const { gbuffer, image } = await readReferenceGbuffer(
      args.reference,
      args.witness,
      args.pose ? toPageCamera(parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length)) : undefined,
    );
    const lutPaths =
      args.luts && existsSync(args.luts)
        ? (await readdir(args.luts)).filter((name) => name.endsWith(".png")).map((name) => join(args.luts ?? "", name))
        : [];
    const calibration = await calibrateScene(gbuffer, image, lutPaths);
    const { fog, grade, isFogFitted, light, luts } = calibration;
    console.log(
      `light: sun ${formatColor(light.sun)}, ambient ${formatColor(light.ambient)}, from heading ${light.direction[0].toFixed(1)} and elevation ${light.direction[1].toFixed(1)}, residual ${light.residual.toFixed(4)}`,
    );
    console.log(
      isFogFitted
        ? `fog: ${formatColor(fog.color)}, density ${fog.density.toPrecision(3)} a metre, residual ${fog.residual.toFixed(4)}`
        : "fog: held clear, the drawn depths too alike to fit it",
    );
    console.log(
      `grade: residual ${(grade.residual * 255).toFixed(2)} of 255, against ${(grade.plainResidual * 255).toFixed(2)} through plain sRGB`,
    );
    for (const { path, residual } of luts.slice(0, 5)) console.log(`  ${path}: ${(residual * 255).toFixed(2)} of 255`);
    const path = join(GBUFFER_DIRECTORY, args.reference, "calibration.json");
    await writeFile(path, JSON.stringify(calibration, null, 2));
    console.log(path);
  },
});
