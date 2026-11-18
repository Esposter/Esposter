import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatEmitterSettings } from "#src/services/genshinAssets/particles/formatEmitterSettings";
import { readComponentParticleSystems } from "#src/services/genshinAssets/particles/readComponentParticleSystems";
import { parseDerivedAssetComponent } from "#src/services/genshinAssets/shared/parseDerivedAssetComponent";
import { defineCommand } from "citty";

export const emittersCommand: SubCommandsDef[string] = defineCommand({
  args: {
    component: {
      description: `The component whose particle systems to read: ${Object.values(DerivedAssetComponent).join(", ")}`,
      required: true,
      type: "positional",
    },
    object: {
      description: "Only the particle systems on game objects whose names match this pattern, such as ^CloudsEmitter_",
      type: "string",
    },
  },
  meta: {
    description:
      "Export every particle system of a component's layout blocks raw and print each on its game object with its rate, life, size and colour: each read from its bytes at the offset the layout places it, or named as not held",
    name: "emitters",
  },
  run: async ({ args }) => {
    const emitters = await readComponentParticleSystems(
      parseDerivedAssetComponent(args.component),
      args.object ? new RegExp(args.object, "u") : undefined,
    );
    console.log(
      emitters
        .map(
          ({ block, file, owner, settings }) =>
            `ParticleSystem on ${owner} [${block} ${file}]\n${formatEmitterSettings(settings)}`,
        )
        .join("\n"),
    );
  },
});
