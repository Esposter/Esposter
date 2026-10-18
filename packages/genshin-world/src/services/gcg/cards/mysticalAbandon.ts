import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";

export const MYSTICAL_ABANDON_ID = 211_071;
const SHENHE_ID = 1_107;
const SPRING_SPIRIT_SUMMONING_ID = 11_072;

// Mystical Abandon, Shenhe's talent: equipped to her while she is active, it has her use Spring Spirit Summoning at once. The
// Icy Quill she creates with it equipped spends no usage on her characters' first Normal Attack each Round (see icyQuill)
export const mysticalAbandon: GcgCardModule = createGcgTalentCard(SHENHE_ID, SPRING_SPIRIT_SUMMONING_ID);
