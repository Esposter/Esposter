import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { createPictureColoursEntry } from "#src/services/genshinAssets/colours/createPictureColoursEntry";
import { createInterfaceRectsEntry } from "#src/services/genshinAssets/fit/createInterfaceRectsFit";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// The character screen's fits: its interface's rects, and the colour each portrait's disc takes in place of its picture
export const createCharacterFit: DerivedAssetFit = (only, options) =>
  runFits(
    [
      createInterfaceRectsEntry(DerivedAssetComponent.Character),
      createPictureColoursEntry(DerivedAssetComponent.Character),
    ],
    only,
    options,
  );
