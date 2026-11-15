// The shapes gcsim's character configs give a hitbox
export const GcsimHitboxShape = { Box: "Box", Circle: "Circle", Hit: "Hit", Single: "Single" } as const;
export type GcsimHitboxShape = (typeof GcsimHitboxShape)[keyof typeof GcsimHitboxShape];
