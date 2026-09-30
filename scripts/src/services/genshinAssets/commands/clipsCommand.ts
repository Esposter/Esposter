import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { extractComponentClips } from "#src/services/genshinAssets/extractComponentClips";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { defineCommand } from "citty";

const format = (value: number): string => String(Math.round(value * 1000) / 1000);

export const clipsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose clips to decode: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
  },
  meta: { description: "Export and decode a component's animation clips, each curve named and sampled", name: "clips" },
  run: async ({ args }) => {
    for (const { curves, duration, name } of await extractComponentClips(parseDerivedAssetComponent(args.component))) {
      console.log(`${name}: ${format(duration)} s`);
      for (const { component, path, property, samples } of curves) {
        const first = samples[0] ?? 0;
        const last = samples.at(-1) ?? 0;
        const moved = samples.some((sample) => Math.abs(sample - first) > 1e-4);
        console.log(
          `  ${path} ${property}${component ? `.${component}` : ""}: ${moved ? `${format(first)} to ${format(last)}, ${format(Math.min(...samples))} to ${format(Math.max(...samples))}` : `held at ${format(first)}`}`,
        );
      }
    }
  },
});
