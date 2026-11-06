import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsEnumValue } from "@esposter/shared";

export const checkIsDerivedAssetComponent = (value: string): value is DerivedAssetComponent =>
  checkIsEnumValue(DerivedAssetComponent, value);
