import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitInfusion } from "#src/models/kit/KitInfusion";

// A live effect on the deployed team, kept in the field's list and ticked each step, until its seconds run out
export type KitEffect = KitBuff | KitInfusion;
