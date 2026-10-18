import type { SubCommandsDef } from "citty";
import type { AvatarManifest } from "genshin-world/sceneExport";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { measureAvatarHeight } from "#src/services/genshinAssets/measure/measureAvatarHeight";
import { measureVerticalExtent } from "#src/services/genshinAssets/measure/measureVerticalExtent";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { defineCommand } from "citty";
import { parsePmx, PMX_UNIT_METRES } from "genshin-engine";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const format = (value: number): string => value.toFixed(4);

export const measureCommand: SubCommandsDef[string] = defineCommand({
  args: {
    model: {
      default: join(EXTRACTED_DIRECTORY, DerivedAssetComponent.PlayerGirl),
      description: "The extracted model's folder, holding its avatar.json and avatar.bin",
      type: "string",
    },
    pmx: {
      description: "The character's PMX model file, whose height is read in MMD units",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Read a model's height in metres and its PMX's height in units, writing nothing",
    name: "measure",
  },
  run: async ({ args }) => {
    const manifest = parseMachineJson<AvatarManifest>(await readFile(join(args.model, "avatar.json"), "utf8"));
    const binary = await readFile(join(args.model, "avatar.bin"));
    const pmx = parsePmx(Uint8Array.from(await readFile(args.pmx)).buffer);
    const modelHeight = measureAvatarHeight(manifest, binary);
    const pmxHeight = measureVerticalExtent([pmx.vertices.positions]);
    console.log(`model height: ${format(modelHeight)} m`);
    console.log(`pmx height: ${format(pmxHeight)} units`);
    console.log(`scale: ${format(modelHeight / pmxHeight)} m per unit`);
    console.log(`reckoned: ${format(pmxHeight * PMX_UNIT_METRES)} m at ${PMX_UNIT_METRES} m per unit`);
  },
});
