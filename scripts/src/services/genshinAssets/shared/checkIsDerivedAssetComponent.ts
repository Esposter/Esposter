import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { COMPONENT_NAMES } from "#src/services/genshinAssets/shared/constants";

export const checkIsDerivedAssetComponent = (value: string): value is DerivedAssetComponent =>
  COMPONENT_NAMES.includes(value);
