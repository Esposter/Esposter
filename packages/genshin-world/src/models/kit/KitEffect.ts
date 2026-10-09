import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitField } from "#src/models/kit/KitField";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

// A live effect on the deployed team, kept in the field's list and ticked each step, until its seconds run out
export type KitEffect = KitBuff | KitField | KitInfusion | KitSummon | KitTaunt;
