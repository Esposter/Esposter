import type { Spinner } from "#src/models/Spinner";
import type { SpinnerTip } from "#src/models/SpinnerTip";
import type { VoiceCard } from "#src/models/VoiceCard";

import { BASE_TIP_ID, NAMEPLATE_PREFIX } from "#src/services/constants";
import { getCardSlug } from "#src/services/getCardSlug";

const getTips = (idPrefix: string, tips: string[]): SpinnerTip[] =>
  tips.map((text, index) => ({ id: `${idPrefix}-${index + 1}`, text }));

// The base content first and the character's behind it; a tip's id is stable across rewrites so its show history
// Survives the character changing
export const getSpinner = (base: VoiceCard, name: string, voiceCard: VoiceCard): Spinner => ({
  label: `${NAMEPLATE_PREFIX}${name}`,
  tips: [...getTips(BASE_TIP_ID, base.tips), ...getTips(getCardSlug(name), voiceCard.tips)],
  verbs: [...base.verbs, ...voiceCard.verbs],
});
