// What a hitbox is centred on. gcsim's character configs name the player, the primary target, a global value, another
// Target or the character's own summon, as the config schema parses them. A Go constructor names a place the code
// Computes, a gadget's or the cast's, as `Position`, where the kit's module puts the hit
export enum GcsimHitboxCenter {
  GlobalValue = "GlobalValue",
  Player = "Player",
  Position = "Position",
  PrimaryTarget = "PrimaryTarget",
  Self = "Self",
  Target = "Target",
}
