import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";

// The centre a source or target argument names by its getter: the player or the primary target, read through its
// `.Pos()` as well
const CENTER_GETTERS: [string, GcsimHitboxCenter][] = [
  ["Combat.Player()", GcsimHitboxCenter.Player],
  ["Combat.Player().Pos()", GcsimHitboxCenter.Player],
  ["Combat.PrimaryTarget()", GcsimHitboxCenter.PrimaryTarget],
  ["Combat.PrimaryTarget().Pos()", GcsimHitboxCenter.PrimaryTarget],
];

export const readGetterCenter = (text: string): GcsimHitboxCenter | undefined =>
  CENTER_GETTERS.find(([getter]) => text.endsWith(getter))?.[1];
