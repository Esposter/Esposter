export const AttackKey = {
  IceShard: "IceShard",
  IceShardStart: "IceShardStart",
  Slash: "Slash",
} as const;
export type AttackKey = keyof typeof AttackKey;
