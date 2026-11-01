import type { KitOverlayChoice } from "#src/models/genshinAssets/kits/record/KitOverlayChoice";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const refuseChoice = (path: string, entry: KitOverlayChoice) =>
  new InvalidOperationError(Operation.Read, path, `has no ${entry.source} value for the overlay to choose`);
