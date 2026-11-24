import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// How a watched trigger type is counted: the kind of doing it takes, the parameter slot its target id or ids sit in,
// And whether its event advances the count by the event's quantity rather than by one. A level trigger names the level
// To reach in the slot its levelSlot gives, and its event's quantity is the level reached, so the count is that level,
// Not a sum. A trigger that counts every doing of its kind, a monster defeated again included, counts each one, where
// The Rest count each named id once. An AND trigger naming a list of ids is done once every named id is counted, rather
// Than at its progress. A two-slot trigger also names a scope in the slot its scopeSlot gives, which the doing's
// `scopeId` must match when that slot names one. A region-only target is not matched to the ids it names, so the
// Doing's scope alone decides, and each target id still counts once
export interface AchievementTriggerWatch {
  countsEveryDoing?: boolean;
  countsQuantity: boolean;
  everyTarget?: boolean;
  kind: AchievementEventKind;
  levelSlot?: number;
  scopeSlot?: number;
  targetIsRegionOnly?: boolean;
  targetSlot: number;
}
