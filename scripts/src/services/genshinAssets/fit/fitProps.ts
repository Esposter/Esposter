import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitPropKind } from "#src/services/genshinAssets/fit/fitPropKind";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { PROP_KINDS } from "#src/services/genshinAssets/props/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";

// The props' fit: each kind of `PROP_KINDS` fitted from its export, in the order they are listed, or only those named
export const fitProps: DerivedAssetFit = (only, options) => {
  const { assets } = getComponentDirectory(DerivedAssetComponent.Props);
  return runFits(
    PROP_KINDS.map((kind) => [kind.name, () => fitPropKind(kind, assets)] as const),
    only,
    options,
  );
};
