import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";

// The component whose witness a reference's comparison reads its layers from: the one given, else the one naming the
// Reference, none for a reference no component names
export const getLayerComponent = (
  referenceId: string,
  witness?: DerivedAssetComponent,
): DerivedAssetComponent | undefined =>
  witness ??
  Object.values(DerivedAssetComponent).find((component) => getComponentReferenceIds(component).includes(referenceId));
