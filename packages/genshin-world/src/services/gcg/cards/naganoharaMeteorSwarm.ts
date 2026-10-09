import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";

const YOIMIYA_ID = 1305;
const NIWABI_FIRE_DANCE_ID = 13_052;

// Naganohara Meteor Swarm: Yoimiya, while active, equips it, and Niwabi Fire-Dance is used at once
export const naganoharaMeteorSwarm: GcgCardModule = createGcgTalentCard(YOIMIYA_ID, NIWABI_FIRE_DANCE_ID);
