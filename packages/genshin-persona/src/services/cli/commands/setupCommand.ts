import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { getCurrentCharacter } from "#src/services/cli/getCurrentCharacter";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { STATUS_LAUNCHER_PATH, STATUS_SCRIPT_PATH } from "#src/services/constants";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readSpinner } from "#src/services/readSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeLauncher } from "#src/services/writeLauncher";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { defineCommand } from "citty";

export const setupCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Setup },
  run: async () => {
    const context = await readGenshinContext();
    const { language, strings } = context;
    writeLauncher(STATUS_LAUNCHER_PATH, STATUS_SCRIPT_PATH);
    const userSettings = readUserSettings();
    const settings = getSettingsWithStatusLine(userSettings);
    writeUserSettings(settings);
    const character = await getCurrentCharacter(context);
    if (character) writeSpinner(await readSpinner(character, await readPersonaCard(character.name), language));
    console.log(checkIsPluginStatusLine(settings.statusLine) ? strings.setupDone : strings.setupStatusLineKept);
  },
});
