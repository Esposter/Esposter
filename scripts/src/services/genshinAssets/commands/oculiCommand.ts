import type { SubCommandsDef } from "citty";

import { writeOculusPlaces } from "#src/services/genshinAssets/oculi/writeOculusPlaces";
import { defineCommand } from "citty";

export const oculiCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each Oculus the official map marks, carried into the scene by the fit, as one slice per region in genshin-world",
    name: "oculi",
  },
  run: async () => {
    console.log(await writeOculusPlaces());
  },
});
