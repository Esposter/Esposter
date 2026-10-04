import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { PLANS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { readWitnessPlan } from "#src/services/genshinParity/witness/readWitnessPlan";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const BYTE = 255;
const toDisplay = (value: number): number => (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055);

export const planCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    family: { description: "The family whose parts to draw", required: true, type: "string" },
    least: {
      description: "The rectangle's least corner on the ground, as x,z in metres",
      required: true,
      type: "string",
    },
    resolution: { default: "100", description: "Pixels a metre", type: "string" },
    size: { description: "The rectangle's size, as x,z in metres", required: true, type: "string" },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Draw a family's parts from straight above over a rectangle of the ground, their unlit albedo, columns toward +x and rows toward +z, for a surface's design read in metres",
    name: "plan",
  },
  run: async ({ args }) => {
    const [leastX = 0, leastZ = 0] = parseNumbers(args.least, "least", 2);
    const [sizeX = 0, sizeZ = 0] = parseNumbers(args.size, "size", 2);
    const [pixelsPerMetre = 0] = parseNumbers(args.resolution, "resolution", 1);
    // A side or a resolution of no length draws a page of no pixels
    if (sizeX <= 0 || sizeZ <= 0)
      throw new InvalidOperationError(Operation.Read, "size", `${args.size} is not positive`);
    if (pixelsPerMetre <= 0)
      throw new InvalidOperationError(Operation.Read, "resolution", `${args.resolution} is not positive`);
    const { albedo, height, size, width } = await readWitnessPlan(args.reference, args.witness, args.family, {
      least: [leastX, leastZ],
      pixelsPerMetre,
      size: [sizeX, sizeZ],
    });
    const pixels = Buffer.alloc(width * height * 3);
    for (let pixel = 0; pixel < width * height; pixel++)
      for (let channel = 0; channel < 3; channel++)
        pixels[pixel * 3 + channel] = Math.round(toDisplay(Math.min(albedo[pixel * 4 + channel] ?? 0, 1)) * BYTE);
    await mkdir(PLANS_DIRECTORY, { recursive: true });
    const name = `${args.reference}.${args.family}`;
    const imagePath = join(PLANS_DIRECTORY, `${name}.png`);
    await sharp(pixels, { raw: { channels: 3, height, width } })
      .png()
      .toFile(imagePath);
    console.log(`${width}×${height} over ${size.map((metres) => metres.toFixed(2)).join(" by ")} metres: ${imagePath}`);
  },
});
