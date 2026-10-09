import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { carryLossToPlan } from "#src/services/genshinParity/passes/carryLossToPlan";
import { compareFamilyColour } from "#src/services/genshinParity/passes/compareFamilyColour";
import { measureFamilyTargets } from "#src/services/genshinParity/passes/measureFamilyTargets";
import { PLANS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { computeLabelSimilarity } from "#src/services/genshinParity/witness/computeLabelSimilarity";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { toByte } from "#src/services/shared/toByte";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A plan's axes by the letters a command line names them with
const AXES = ["x", "y", "z"];
// The loss a cell's pixels average that the image draws at full red, as the structure image draws a pixel's
const LOST_FULL = 0.5;
// The bands across the plan printed, the most lost first
const PRINTED_BAND_COUNT = 12;

export const lostCommand: SubCommandsDef[string] = defineCommand({
  args: {
    axes: {
      default: "x,z",
      description: "The plan's two axes of our part's own geometry, as two of x, y and z",
      type: "string",
    },
    band: {
      default: "0.05",
      description: "The width in metres of each band across the plan's first axis",
      type: "string",
    },
    component: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
    corner: { description: "The plan's least corner along its two axes, in metres", required: true, type: "string" },
    family: { description: "The family whose loss to carry", required: true, type: "string" },
    resolution: { default: "50", description: "Cells a metre", type: "string" },
    size: { description: "The plan's size along its two axes, in metres", required: true, type: "string" },
  },
  meta: {
    description:
      "Carry the surface pass's structure loss onto a family's plan, at each current build reference's camera: each band across its first axis's share of the loss against its share of the pixels, the most lost first, and an image of the plan, columns along its first axis and rows along its second, red as structure is lost",
    name: "lost",
  },
  run: async ({ args }) => {
    const axes = args.axes.split(",").map((axis) => AXES.indexOf(axis.trim()));
    const [firstAxis = -1, secondAxis = -1] = axes;
    if (axes.length !== 2 || firstAxis < 0 || secondAxis < 0 || firstAxis === secondAxis)
      throw new InvalidOperationError(
        Operation.Read,
        "axes",
        `${args.axes} is not two different of ${AXES.join(", ")}`,
      );
    const [cornerFirst = 0, cornerSecond = 0] = parseNumbers(args.corner, "corner", 2);
    const [sizeFirst = 0, sizeSecond = 0] = parseNumbers(args.size, "size", 2);
    const [pixelsPerMetre = 0] = parseNumbers(args.resolution, "resolution", 1);
    const [band = 0] = parseNumbers(args.band, "band", 1);
    if (sizeFirst <= 0 || sizeSecond <= 0 || pixelsPerMetre <= 0 || band <= 0)
      throw new InvalidOperationError(Operation.Read, "plan", "its size, resolution and band are not all positive");
    const { notes } = await measureFamilyTargets(
      args.component,
      [WitnessTargetName.Part, WitnessTargetName.Albedo, WitnessTargetName.Position],
      async (referenceId, exportsRead, oursRead, page) => {
        const { families, width } = exportsRead;
        const family = families.indexOf(args.family);
        if (family === -1)
          throw new InvalidOperationError(
            Operation.Read,
            "family",
            `${args.family} is not one of ${families.join(", ")}`,
          );
        const read = (targets: typeof exportsRead.targets) => ({
          colour: targets.albedo ?? new Float32Array(),
          part: targets.part ?? new Float32Array(),
        });
        const { termMaps } = await compareFamilyColour(
          read(exportsRead.targets),
          read(oursRead.targets),
          width,
          families.length,
          (input) => computeLabelSimilarity(page, input),
        );
        const plan = carryLossToPlan(
          termMaps,
          {
            part: oursRead.targets.part ?? new Float32Array(),
            position: oursRead.targets.position ?? new Float32Array(),
          },
          {
            axes: [firstAxis, secondAxis],
            corner: [cornerFirst, cornerSecond],
            family,
            pixelsPerMetre,
            size: [sizeFirst, sizeSecond],
            width,
          },
        );
        const cellsPerBand = Math.max(Math.round(band * pixelsPerMetre), 1);
        const bandCount = Math.ceil(plan.width / cellsPerBand);
        const bandLosses = new Float64Array(bandCount);
        const bandCounts = new Float64Array(bandCount);
        for (let cell = 0; cell < plan.width * plan.height; cell++) {
          const bandIndex = Math.floor((cell % plan.width) / cellsPerBand);
          bandLosses[bandIndex] = (bandLosses[bandIndex] ?? 0) + (plan.losses[cell] ?? 0);
          bandCounts[bandIndex] = (bandCounts[bandIndex] ?? 0) + (plan.counts[cell] ?? 0);
        }
        const totalLoss = bandLosses.reduce((sum, loss) => sum + loss, 0);
        const totalCount = bandCounts.reduce((sum, count) => sum + count, 0);
        const toMetres = (bandIndex: number): string =>
          (cornerFirst + (bandIndex * cellsPerBand) / pixelsPerMetre).toFixed(2);
        const bandNotes = Array.from({ length: bandCount }, (_band, bandIndex) => bandIndex)
          .toSorted((firstBand, secondBand) => (bandLosses[secondBand] ?? 0) - (bandLosses[firstBand] ?? 0))
          .slice(0, PRINTED_BAND_COUNT)
          .map(
            (bandIndex) =>
              `${referenceId} ${args.family} ${AXES[firstAxis]} ${toMetres(bandIndex)} to ${toMetres(bandIndex + 1)}: ${((100 * (bandLosses[bandIndex] ?? 0)) / Math.max(totalLoss, Number.EPSILON)).toFixed(1)}% of the loss over ${((100 * (bandCounts[bandIndex] ?? 0)) / Math.max(totalCount, 1)).toFixed(1)}% of the pixels, ${((bandLosses[bandIndex] ?? 0) / Math.max(bandCounts[bandIndex] ?? 0, 1)).toFixed(3)} a pixel`,
          );
        const pixels = Buffer.alloc(plan.width * plan.height * 3);
        for (let cell = 0; cell < plan.width * plan.height; cell++) {
          const count = plan.counts[cell] ?? 0;
          const share = count > 0 ? (plan.losses[cell] ?? 0) / count / LOST_FULL : 0;
          [pixels[cell * 3], pixels[cell * 3 + 1], pixels[cell * 3 + 2]] = [
            toByte(share),
            toByte(share - 1),
            toByte(share - 1),
          ];
        }
        await mkdir(PLANS_DIRECTORY, { recursive: true });
        const imagePath = join(PLANS_DIRECTORY, `${referenceId}.${args.family}.lost.png`);
        await sharp(pixels, { raw: { channels: 3, height: plan.height, width: plan.width } })
          .png()
          .toFile(imagePath);
        return {
          notes: [
            `${referenceId} ${args.family}: ${(totalLoss / Math.max(totalCount, 1)).toFixed(4)} lost a pixel over ${totalCount} pixels, ${plan.width}×${plan.height} cells: ${imagePath}`,
            ...bandNotes,
          ],
          readings: [],
        };
      },
    );
    for (const note of notes) console.log(note);
  },
});
