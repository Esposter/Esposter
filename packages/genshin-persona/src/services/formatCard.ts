import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";
import { formatPersonaCard } from "#src/services/formatPersonaCard";

// The card as the model reads it, and as the skill's command prints it
export const formatCard = ({ description, headline, note, personaCard }: Card): string =>
  [`${CONTEXT_HEADLINE_PREFIX}${headline}`, description, note, personaCard ? formatPersonaCard(personaCard) : ""]
    .filter(Boolean)
    .join("\n");
