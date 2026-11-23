import type { EnumArgDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// The component whose exports a witness command draws, as every command that draws one takes it
export const witnessArg: { required: true } & EnumArgDef = {
  description: "The component whose exports the witness draws",
  options: Object.values(DerivedAssetComponent),
  required: true,
  type: "enum",
};
