import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { deleteVoiceState } from "#src/services/deleteVoiceState";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { defineCommand } from "citty";

export const teardownCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Teardown },
  run: async () => {
    const { strings } = await readGenshinContext();
    const userSettings = readUserSettings();
    const settings = getSettingsWithoutPluginEntries(userSettings);
    writeUserSettings(settings);
    await deleteVoiceState();
    console.log(strings.teardownDone);
  },
});
