import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsDerivedAssetComponent } from "#src/services/genshinAssets/shared/checkIsDerivedAssetComponent";
import { COMPONENT_NAMES } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component named on the command line, one of those the tool knows, which citty cannot check for a positional
export const parseDerivedAssetComponent = (value: string): DerivedAssetComponent => {
  if (checkIsDerivedAssetComponent(value)) return value;
  else throw new InvalidOperationError(Operation.Read, value, `not a component: one of ${COMPONENT_NAMES.join(", ")}`);
};
