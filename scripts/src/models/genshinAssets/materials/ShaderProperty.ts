import type { ShaderPropertyType } from "#src/models/genshinAssets/materials/ShaderPropertyType";

// A property a shader declares: its name, its type and its flags, the gamma flag among them
export interface ShaderProperty {
  flags: number;
  name: string;
  type: ShaderPropertyType;
}
