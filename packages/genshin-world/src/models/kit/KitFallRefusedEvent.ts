import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A kit refused a member's fall, leaving the member standing at the share its refusal keeps. The change that left it so
// Is sent just before this event
export interface KitFallRefusedEvent {
  characterId: number;
  kind: KitEventKind.FallRefused;
}
