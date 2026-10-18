import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { KitShield } from "#src/models/kit/KitShield";

// A shield was cast onto the team: the shield as it stands, whose character is the one that cast it, or that
// Crystallized the shard it came from
export interface KitShieldCastEvent {
  kind: KitEventKind.ShieldCast;
  shield: KitShield;
}
