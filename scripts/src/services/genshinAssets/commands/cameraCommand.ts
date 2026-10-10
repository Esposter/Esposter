import type { SubCommandsDef } from "citty";

import { readCameraProfile } from "#src/services/genshinAssets/camera/readCameraProfile";
import { defineCommand } from "citty";

export const cameraCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Export the game's camera profile and print the camera module each of its configs serves, then its global config word by word, each named as the 2022 dummy scripts name it",
    name: "camera",
  },
  run: async () => {
    const { globalConfig, moduleTypes } = await readCameraProfile();
    console.log(`module types: ${moduleTypes.join(", ")}`);
    // Each value to the seven significant digits a single-precision word holds
    for (const [index, { name, value }] of globalConfig.entries())
      console.log(`${index} ${name || "(a field added since 2022)"}: ${Number(value.toPrecision(7))}`);
  },
});
