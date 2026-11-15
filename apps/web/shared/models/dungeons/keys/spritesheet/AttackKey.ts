// Spritesheet keys are their own domain: attacks share animation components (see AttackComponentMap),
// So there are fewer spritesheets than AttackIds.
export const AttackKey = { "Ice Shard": "Ice Shard", "Ice Shard Start": "Ice Shard Start", Slash: "Slash" } as const;
export type AttackKey = (typeof AttackKey)[keyof typeof AttackKey];
