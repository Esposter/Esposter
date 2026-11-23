import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatMeasurement } from "#src/services/genshinAssets/commands/formatMeasurement";
import { measureAvatarHeight } from "#src/services/genshinAssets/measure/measureAvatarHeight";
import { measureVerticalExtent } from "#src/services/genshinAssets/measure/measureVerticalExtent";
import { publishCharacterScale } from "#src/services/genshinAssets/measure/publishCharacterScale";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { defineCommand } from "citty";
import { parsePmx } from "genshin-engine";
import { avatarManifestSchema, TRAVELER_CHARACTER_ID } from "genshin-world";
import { AVATAR_BINARY_FILE_NAME, AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const measureCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    character: {
      default: String(TRAVELER_CHARACTER_ID),
      description: "The id of the character the PMX is, under which its scale is published",
      type: "string",
    },
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
    description:
      "Read a model's height in metres and its PMX's height in units, and publish the PMX's scale under its character",
    name: "measure",
  },
  run: async ({ args }) => {
    const manifest = avatarManifestSchema.parse(
      parseMachineJson(await readFile(join(args.model, AVATAR_MANIFEST_FILE_NAME), "utf8")),
    );
    const binary = await readFile(join(args.model, AVATAR_BINARY_FILE_NAME));
    const pmx = parsePmx(Uint8Array.from(await readFile(args.pmx)).buffer);
    const modelHeight = measureAvatarHeight(manifest, binary);
    const pmxHeight = measureVerticalExtent([pmx.vertices.positions]);
    console.log(`model height: ${formatMeasurement(modelHeight)} m`);
    console.log(`pmx height: ${formatMeasurement(pmxHeight)} units`);
    const metresPerUnit = modelHeight / pmxHeight;
    console.log(`scale: ${formatMeasurement(metresPerUnit)} m per unit`);
    console.log(
      await publishCharacterScale(
        Number(args.character),
        { metresPerUnit, modelHeightMetres: modelHeight, pmxHeightUnits: pmxHeight },
        args["dry-run"],
      ),
    );
  },
});
