import type { PersonaCard } from "#src/models/PersonaCard";

import { PERSONA_CARDS_DIRECTORY } from "#src/services/constants";
import { readPersonaModule } from "#src/services/readPersonaModule";

export const readPersonaCard = (name: string): Promise<PersonaCard | undefined> =>
  readPersonaModule<PersonaCard>(PERSONA_CARDS_DIRECTORY, name);
