import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

// A constant of a gcsim character's package with the name it is defined by
export interface GoNamedConstant extends GoConstant {
  name: string;
}
