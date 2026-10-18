import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { SHENHE_ID, SPRING_SPIRIT_SUMMONING_ID } from "#src/services/gcg/cards/constants";

// Mystical Abandon, Shenhe's talent: equipped to her while she is active, it has her use Spring Spirit Summoning at once. The
// Icy Quill she creates with it equipped spends no usage on her characters' first Normal Attack each Round (see icyQuill)
export const mysticalAbandon: GcgCardModule = createGcgTalentCard(SHENHE_ID, SPRING_SPIRIT_SUMMONING_ID);
