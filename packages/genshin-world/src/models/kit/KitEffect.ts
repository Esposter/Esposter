import type { KitBubble } from "#src/models/kit/KitBubble";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitField } from "#src/models/kit/KitField";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

// A live effect on the deployed team, kept in the field's list and ticked each step, until its seconds run out
export type KitEffect =
  | KitBubble
  | KitBuff
  | KitField
  | KitInfusion
  | KitShield
  | KitStance
  | KitStatus
  | KitSummon
  | KitTaunt;
