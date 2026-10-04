import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { InvalidOperationError, Operation } from "@esposter/shared";

const components: readonly string[] = Object.values(DerivedAssetComponent);
const checkIsDerivedAssetComponent = (value: string): value is DerivedAssetComponent => components.includes(value);
// A component named on the command line, one of those the tool knows, which citty cannot check for a positional
export const parseDerivedAssetComponent = (value: string): DerivedAssetComponent => {
  if (checkIsDerivedAssetComponent(value)) return value;
  throw new InvalidOperationError(Operation.Read, value, `not a component: one of ${components.join(", ")}`);
};
