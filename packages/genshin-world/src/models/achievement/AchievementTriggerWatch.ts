import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// How a watched trigger type is counted: the kind of doing it takes, the parameter slot its target id or ids sit in, and
// Whether its event advances the count by the event's quantity rather than by one. A level trigger names the level to
// Reach in the slot its levelSlot gives, and its event's quantity is the level reached, so the count is that level, not
// A sum. A trigger that counts every doing of its kind, a monster defeated again included, counts each one, where the
// Rest count each named id once. An AND trigger naming a list of ids is done once every named id is counted, rather than
// At its progress. A two-slot trigger also names a scope in the slot its scopeSlot gives, which the doing's scopeId must
// Match when that slot names one
export interface AchievementTriggerWatch {
  countsEveryDoing?: boolean;
  countsQuantity: boolean;
  everyTarget?: boolean;
  kind: AchievementEventKind;
  levelSlot?: number;
  scopeSlot?: number;
  targetSlot: number;
}
