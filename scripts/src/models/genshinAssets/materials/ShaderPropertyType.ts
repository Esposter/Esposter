// A shader property's type, as Unity serializes it (its SerializedPropertyType)
export const ShaderPropertyType = { Color: 0, Vector: 1, Float: 2, Range: 3, Texture: 4 } as const;
export type ShaderPropertyType = (typeof ShaderPropertyType)[keyof typeof ShaderPropertyType];
