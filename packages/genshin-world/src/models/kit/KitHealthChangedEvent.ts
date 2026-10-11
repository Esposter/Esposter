import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { PartyHealthChange } from "#src/models/party/PartyHealthChange";

// A party member's HP changed: by a heal, a drain, an enemy's strike or a drown, as the party recorded it
export interface KitHealthChangedEvent extends PartyHealthChange {
  kind: KitEventKind.HealthChanged;
}
