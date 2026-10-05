import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { InvalidOperationError, Operation } from "@esposter/shared";

const COMPONENT_NAMES: readonly string[] = Object.values(DerivedAssetComponent);
const checkIsDerivedAssetComponent = (value: string): value is DerivedAssetComponent => COMPONENT_NAMES.includes(value);
// A component named on the command line, one of those the tool knows, which citty cannot check for a positional
export const parseDerivedAssetComponent = (value: string): DerivedAssetComponent => {
  if (checkIsDerivedAssetComponent(value)) return value;
  else throw new InvalidOperationError(Operation.Read, value, `not a component: one of ${COMPONENT_NAMES.join(", ")}`);
};
