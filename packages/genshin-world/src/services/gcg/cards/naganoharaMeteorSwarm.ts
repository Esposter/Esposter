import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { NIWABI_FIRE_DANCE_ID, YOIMIYA_ID } from "#src/services/gcg/cards/constants";

// Naganohara Meteor Swarm: Yoimiya, while active, equips it, and Niwabi Fire-Dance is used at once
export const naganoharaMeteorSwarm: GcgCardModule = createGcgTalentCard(YOIMIYA_ID, NIWABI_FIRE_DANCE_ID);
