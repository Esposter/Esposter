import type { PersonaCard } from "#src/models/PersonaCard";

import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { readSpinner } from "#src/services/readSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeSpinner } from "#src/services/writeSpinner";

// The spinner follows the character only where `setup` opted the settings in, and only when it is not already
// This character's — the label is their name — since the lines behind it cost the data package or the wiki. A
// Card edited since is picked up by `setup`, which reads the spinner afresh
export const writeSessionSpinner = async (name: string, personaCard: PersonaCard | undefined): Promise<void> => {
  const settings = readUserSettings();
  if (!checkIsPluginSpinner(settings) || settings.spinnerTipsOverride?.label === name) return;

  const spinner = await readSpinner(name, personaCard);
  writeSpinner(spinner);
};
