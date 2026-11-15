export const BaseTextureSetter = { Frame: "frame", Texture: "texture" } as const;
export type BaseTextureSetter = (typeof BaseTextureSetter)[keyof typeof BaseTextureSetter];
