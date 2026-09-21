import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";
import { formatPersonaCard } from "#src/services/formatPersonaCard";

// The card as the model reads it, and as the skill's command prints it — which is one stream with two readers, so
// Every line of it that has an interface language is in it
export const formatCard = ({ description, greeting, headline, note, personaCard }: Card): string =>
  [
    `${CONTEXT_HEADLINE_PREFIX}${headline}`,
    description,
    note,
    personaCard ? formatPersonaCard(personaCard, greeting) : "",
  ]
    .filter(Boolean)
    .join("\n");
