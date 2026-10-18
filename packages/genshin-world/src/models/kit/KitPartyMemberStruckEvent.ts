import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// An enemy's strike landed on a party member: the enemy that struck, the member it struck, and whether a shield on the
// Team took any of it, so a strike a shield absorbed whole is told as well as one that cost the member HP
export interface KitPartyMemberStruckEvent {
  isShielded: boolean;
  kind: KitEventKind.PartyMemberStruck;
  striker: Enemy;
  struckCharacterId: number;
}
