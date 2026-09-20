import type { Character } from "#src/models/Character";
import type { PersonaCard } from "#src/models/PersonaCard";

import { BASE_SPINNER_CONTENT } from "#src/services/baseSpinnerContent";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { getSpinner } from "#src/services/getSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeSpinner } from "#src/services/writeSpinner";

// The spinner follows the character only where `setup` opted the settings in
export const writeSessionSpinner = ({ name }: Character, personaCard: PersonaCard | undefined): void => {
  const settings = readUserSettings();
  if (checkIsPluginSpinner(settings)) writeSpinner(getSpinner(BASE_SPINNER_CONTENT, name, personaCard));
};
