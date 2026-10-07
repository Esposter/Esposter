import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { solveReferenceCloudLayer } from "#src/services/genshinParity/sky/solveReferenceCloudLayer";
import { parseNames } from "#src/services/shared/parseNames";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const layerCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ours: {
      default: false,
      description: "Draw the layer over the textures the scene synthesizes rather than the game's own",
      type: "boolean",
    },
    iterations: { default: "60", description: "How many steps the simplex takes", type: "string" },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    settings: {
      default: "{}",
      description:
        'The settings drawn, as JSON: a cloud layer uniform by name, "coverage" the sky\'s cloud coverage, "cover.<band>" a cloud band\'s share',
      type: "string",
    },
    solve: {
      default: "",
      description: "The settings to solve from their values given, separated by commas",
      type: "string",
    },
    witness: {
      description: "The component whose exports mark the sky's pixels",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "The scene's cloud layer drawn over the game's own textures at a reference's camera, its sky read against the reference's as the atmosphere pass reads it, and the settings named solved to the least of its readings over their gates",
    name: "layer",
  },
  run: async ({ args }) => {
    const iterationCount = Number(args.iterations);
    if (!Number.isInteger(iterationCount) || iterationCount < 0)
      throw new InvalidOperationError(Operation.Read, "iterations", `${args.iterations} is not a count`);
    const { measure, settings } = await solveReferenceCloudLayer(
      args.reference,
      args.witness,
      jsonDateParse<Record<string, number | number[]>>(args.settings),
      args.solve ? parseNames(args.solve, "solve") : [],
      iterationCount,
      args.ours,
    );
    for (const { gate, name, unit, value } of measure.readings)
      console.log(
        `${name}: ${value.toFixed(4)} ${unit} against ${formatPassValue(gate)} ${value <= gate ? "held" : "FAILED"}`,
      );
    for (const note of measure.notes) console.log(note);
    console.log(`settings ${JSON.stringify(settings)}`);
  },
});
