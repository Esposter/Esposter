import type { Card } from "#src/models/Card";

import { CONTEXT_HEADLINE_PREFIX } from "#src/services/constants";

// The card as the model reads it, and as the skill's command prints it
export const formatCard = ({ headline, note, voiceCard }: Card): string =>
  [`${CONTEXT_HEADLINE_PREFIX}${headline}`, note, voiceCard].filter(Boolean).join("\n");
