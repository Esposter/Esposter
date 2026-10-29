import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { extractComponentClips } from "#src/services/genshinAssets/interface/extractComponentClips";
import { formatRoundedValue } from "#src/services/genshinAssets/shared/formatRoundedValue";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

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
      console.log(`${name}: ${formatRoundedValue(duration)} s`);
      for (const { component, path, property, samples } of curves) {
        const first = samples[0] ?? 0;
        const last = samples.at(-1) ?? 0;
        const moved = samples.some((sample) => Math.abs(sample - first) > 1e-4);
        console.log(
          `  ${path} ${property}${component ? `.${component}` : ""}: ${moved ? `${formatRoundedValue(first)} to ${formatRoundedValue(last)}, ${formatRoundedValue(Math.min(...samples))} to ${formatRoundedValue(Math.max(...samples))}` : `held at ${formatRoundedValue(first)}`}`,
        );
      }
    }
  },
});
