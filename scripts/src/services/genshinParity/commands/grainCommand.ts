import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { fitSurfaceGrain } from "#src/services/genshinParity/passes/fitSurfaceGrain";
import { defineCommand } from "citty";

export const grainCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose family's grain to fit: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    family: {
      description: "The family whose grain is fitted, as the scene names it, e.g. Walkway",
      required: true,
      type: "string",
    },
    reference: {
      description: "The reference the grain is fitted against, one of the component's current references",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "Fit a family's surface grain to its exports' structure at the reference's camera: its octave amplitudes set on the live render, and each target stepped by a damped Newton over the family's own response",
    name: "grain",
  },
  run: async ({ args }) => {
    const component = parseDerivedAssetComponent(args.component);
    const { converged, detail, iterations, residuals } = await fitSurfaceGrain(component, args.reference, args.family);
    console.log(
      `${args.family} grain on ${args.reference}: ${converged ? "converged" : "not converged"} in ${iterations} steps`,
    );
    console.log(
      `structure terms, variance then bands finest first: ${residuals.map((term) => term.toFixed(4)).join(", ")}`,
    );
    console.log(`bands: ${detail.bands.map((band) => band.toPrecision(8)).join(", ")}`);
    console.log(`variance: ${detail.variance.toPrecision(8)}`);
  },
});
