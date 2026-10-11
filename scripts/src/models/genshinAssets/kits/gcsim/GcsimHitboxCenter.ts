// What gcsim's character configs centre a hitbox on: the player, the primary target, another target, the character's
// Own summon, or a position the code computes
export enum GcsimHitboxCenter {
  GlobalValue = "GlobalValue",
  Player = "Player",
  PrimaryTarget = "PrimaryTarget",
  Self = "Self",
  Target = "Target",
}
