import type { PersonaCard } from "#src/models/PersonaCard";
import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { readSpinner } from "#src/services/readSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeUserSettings } from "#src/services/writeUserSettings";

// The spinner follows the character only where `setup` opted the settings in, and only when it is not already
// This character's — the label is their name — since the lines behind it cost the data package or the wiki. A
// Card edited since is picked up by `setup`, which reads the spinner afresh. The lines are read between the two
// Settings reads, and a `teardown` landing in that window has taken the spinner out: the write is the second
// Read's, so the ownership it was decided on is the ownership written back, and a spinner torn down while the
// Lines were read is not restored. The first read only spares the lines where nothing would be written anyway
export const writeSessionSpinner = async (name: string, personaCard: PersonaCard | undefined): Promise<void> => {
  const checkIsRewriteOwed = (settings: UserSettings) =>
    checkIsPluginSpinner(settings) && settings.spinnerTipsOverride?.label !== name;
  if (!checkIsRewriteOwed(readUserSettings())) return;

  const spinner = await readSpinner(name, personaCard);
  const settings = readUserSettings();
  if (!checkIsRewriteOwed(settings)) return;

  writeUserSettings(getSettingsWithSpinner(settings, spinner));
};
