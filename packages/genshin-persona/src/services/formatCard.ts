import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";

// The card as the model reads it, and as the skill's command prints it
export const formatCard = ({ description, headline, note, voiceCard }: Card): string =>
  [`${CONTEXT_HEADLINE_PREFIX}${headline}`, description, note, voiceCard.context].filter(Boolean).join("\n");
