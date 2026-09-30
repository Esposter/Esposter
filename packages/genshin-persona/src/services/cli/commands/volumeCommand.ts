import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { checkIsVolume } from "#src/services/checkIsVolume";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { MAX_VOLUME } from "#src/services/constants";
import { writeVolume } from "#src/services/writeVolume";
import { defineCommand } from "citty";

export const volumeCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Volume },
  run: async ({ args }) => {
    const { strings } = await readGenshinContext();
    const name = args._.join(" ");
    if (!checkIsVolume(name)) {
      console.error(strings.volumeMustBeWholeNumber(MAX_VOLUME));
      process.exitCode = 1;
      return;
    }

    writeVolume(name);
    console.log(strings.volumeSet(name));
  },
});
